export interface FlightOption {
    id: string;
    airline: string;
    path: string;
    time: string;
    price: string;
    tag: string;
    scarcityMsg?: string;
}

export interface HotelOption {
    id: string;
    name: string;
    location: string;
    rating: string;
    price: string;
    image: string;
    tag: string;
    scarcityMsg?: string;
}
