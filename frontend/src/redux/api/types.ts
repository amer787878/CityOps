export interface GenericResponse {
    status: string;
    message: string;
}

export interface IUser {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    lastLogin: string;
    role: string;
    avatar?: string;
    _id: string;
    createdAt: string;
    updatedAtt: string;
}

export interface RegisterUserRequest {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface ContactRequest {
    email: string;
    content: string;
}

export interface WeatherMain {
    temp_max: number;
    temp_min: number;
    humidity: number;
}

export interface WeatherWind {
    speed: number;
}

export interface WeatherDescription {
    description: string;
}

export interface WeatherData {
    main: WeatherMain;
    wind: WeatherWind;
    weather: WeatherDescription[];
}

export interface TokenResponse {
    accessToken?: string;
}

export interface RefreshResult {
    accessToken: string;
    userData: any;
}

export interface IProductRequest {
    name: string;
    detail: string;
    stock: number;
    price: number;
    productImg: string;
}

export interface IProductResponse {
    _id: string;
    name: string;
    detail: string;
    stock: number;
    price: number;
    productImg: string;
    user: IUser;
    createdAt: string;
    updated_at: string;
}

export interface UploadProductImageRequest {
    productFile: File;
}

export interface ProductImageResult {
    imageUri: string;
};

export interface UploadReviewImageRequest {
    reviewFile: File;
}

export interface ReviewImageResult {
    imageUri: string;
};

export interface LastFlightRequest {
    date: string;
    item: string;
    duration: string;
    location: string;
    comment: string;
};

export interface ProfileRequest {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
}



