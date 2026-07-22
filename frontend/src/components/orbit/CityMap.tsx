import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { PlanEvent } from '../../data/mocks';
import { getMapStyleUrl } from '../../lib/maps';

interface CityMapProps {
    events: PlanEvent[];
    currentDay: number;
}

export const CityMap: React.FC<CityMapProps> = ({ events, currentDay }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);

    // Helper: get [lng, lat] from an event's coordinates (supports both old x/y and new lat/lon)
    const getLngLat = (coords: NonNullable<PlanEvent['coordinates']>): [number, number] | null => {
        if (coords.lat !== undefined && coords.lon !== undefined) {
            return [coords.lon, coords.lat];
        }
        if (coords.x !== undefined && coords.y !== undefined) {
            // Legacy mock: X: 0-100 -> Lon: 73.7 to 74.1, Y: 0-100 -> Lat: 15.6 to 15.0
            const lon = 73.7 + (coords.x / 100) * 0.4;
            const lat = 15.6 - (coords.y / 100) * 0.6;
            return [lon, lat];
        }
        return null;
    };

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'flight': return '#3b82f6';   // blue
            case 'hotel': return '#a855f7';     // purple
            case 'transfer': return '#64748b';  // slate
            default: return '#10b981';          // emerald for activity
        }
    };

    useEffect(() => {
        if (!mapContainer.current) return;

        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        const nodes = events.filter(e => e.coordinates);
        if (nodes.length === 0) {
            // Initialize map with a default view if no events yet
            if (!map.current) {
                map.current = new maplibregl.Map({
                    container: mapContainer.current,
                    style: getMapStyleUrl(),
                    center: [78.9629, 20.5937], // Center of India
                    zoom: 4,
                    attributionControl: false
                });
            }
            return;
        }

        // Compute center from first node
        const firstCoords = getLngLat(nodes[0].coordinates!);
        if (!firstCoords) return;

        if (!map.current) {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: getMapStyleUrl(),
                center: firstCoords,
                zoom: 10,
                attributionControl: false
            });
        }

        const currentMap = map.current;

        // Wait for map to load before adding markers
        const addMarkers = () => {
            const bounds = new maplibregl.LngLatBounds();
            const DAY_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];
            
            // 1. Group by proximity to detect overlaps
            const groups: { [key: string]: { node: PlanEvent, lngLat: [number, number], original: [number, number] }[] } = {};
            nodes.forEach(node => {
                const lngLat = getLngLat(node.coordinates!);
                if (!lngLat) return;
                // Grid grouping by ~100m buckets to find overlaps
                const gridX = Math.round(lngLat[0] * 1000);
                const gridY = Math.round(lngLat[1] * 1000);
                const key = `${gridX}-${gridY}`;
                if (!groups[key]) groups[key] = [];
                groups[key].push({ node, lngLat: [...lngLat] as [number, number], original: [...lngLat] as [number, number] });
            });

            // 2. Apply offsets
            Object.values(groups).forEach(group => {
                const count = group.length;
                group.forEach((item, index) => {
                    if (count > 1) {
                        // Offset in a circle
                        const angle = (index / count) * Math.PI * 2;
                        const radius = 0.0005; // ~50 meters
                        item.lngLat[0] += Math.cos(angle) * radius;
                        item.lngLat[1] += Math.sin(angle) * radius;
                    }
                });
            });

            // Reconstruct the ordered array for routes and markers
            const processedNodes = nodes.map(node => {
                let foundItem;
                for (const group of Object.values(groups)) {
                    foundItem = group.find(g => g.node.id === node.id);
                    if (foundItem) break;
                }
                return foundItem;
            }).filter(Boolean) as { node: PlanEvent, lngLat: [number, number], original: [number, number] }[];

            const routeCoords: [number, number][] = [];

            processedNodes.forEach(({ node, lngLat }) => {
                routeCoords.push(lngLat); // Draw line to the offset rendered spot
                bounds.extend(lngLat);

                // Create styled marker element
                const el = document.createElement('div');
                const color = getMarkerColor(node.type);
                el.style.cssText = `
                    width: 16px; height: 16px; border-radius: 50%;
                    background: ${color}; border: 2px solid #0a0f1c;
                    box-shadow: 0 0 12px ${color}80;
                    cursor: pointer; position: relative;
                `;

                // Popup on hover
                const popup = new maplibregl.Popup({
                    offset: 20,
                    closeButton: false,
                    closeOnClick: false,
                    className: 'orbit-popup'
                }).setHTML(`
                    <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:8px 12px;color:white;font-size:12px;min-width:120px;">
                        <div style="font-weight:700;">${node.title}</div>
                        <div style="color:#94a3b8;font-size:10px;margin-top:2px;">${node.subtitle}</div>
                        ${node.time ? `<div style="color:#38bdf8;font-size:10px;margin-top:4px;">${node.time}</div>` : ''}
                    </div>
                `);

                el.addEventListener('mouseenter', () => popup.addTo(currentMap));
                el.addEventListener('mouseleave', () => popup.remove());

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat(lngLat)
                    .setPopup(popup)
                    .addTo(currentMap);

                markers.current.push(marker);
            });

            // 3. Draw route line
            if (currentMap.getSource('route')) {
                (currentMap.getSource('route') as maplibregl.GeoJSONSource).setData({
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'LineString', coordinates: routeCoords }
                });
                currentMap.setPaintProperty('route', 'line-color', DAY_COLORS[(currentDay - 1) % DAY_COLORS.length]);
            } else {
                currentMap.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'LineString', coordinates: routeCoords }
                    }
                });
                currentMap.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': DAY_COLORS[(currentDay - 1) % DAY_COLORS.length],
                        'line-width': 4,
                        'line-dasharray': [2, 2]
                    }
                });
            }

            if (processedNodes.length > 1) {
                currentMap.fitBounds(bounds, { padding: 60, duration: 1200 });
            } else if (processedNodes.length === 1) {
                currentMap.flyTo({ center: processedNodes[0].lngLat, zoom: 13, duration: 1000 });
            }
        };

        if (currentMap.loaded()) {
            addMarkers();
        } else {
            currentMap.on('load', addMarkers);
        }
    }, [events, currentDay]);

    return (
        <div className="w-full h-[400px] relative overflow-hidden rounded-xl border border-orbit-700/50 bg-orbit-950 shadow-2xl">
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
            
            {/* Subtle overlay to blend with theme */}
            <div className="absolute inset-0 pointer-events-none bg-orbit-950/10" />
            
            {/* Legend */}
            <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-none z-10">
                <div className="flex items-center gap-1 bg-orbit-950/90 backdrop-blur px-2 py-1 rounded border border-orbit-800">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[10px] text-text-secondary">Transit</span>
                </div>
                <div className="flex items-center gap-1 bg-orbit-950/90 backdrop-blur px-2 py-1 rounded border border-orbit-800">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> <span className="text-[10px] text-text-secondary">Stay</span>
                </div>
                <div className="flex items-center gap-1 bg-orbit-950/90 backdrop-blur px-2 py-1 rounded border border-orbit-800">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-[10px] text-text-secondary">Activity</span>
                </div>
            </div>

            {/* Day indicator */}
            <div className="absolute top-4 left-4 bg-orbit-950/90 backdrop-blur px-3 py-1.5 rounded-lg border border-orbit-800 z-10">
                <span className="text-[11px] font-mono text-accent-400 font-bold">DAY {currentDay}</span>
            </div>
        </div>
    );
};
