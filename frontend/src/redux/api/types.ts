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
    fullname: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: string;
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface IssueSubmissionRequest {
    description: string; 
    photo?: File; 
    audio?: File;
    address: string;
}

export interface IIssue {
    id: number;
    description: string;
    address: string;
    priority: string;
    status: string;
    dateSubmitted: string;
}

export interface IComment {
    id: number;
    author: string;
    timestamp: string;
    content: string;
}

export interface IIssueDetail {
    id: number;
    description: string;
    photo?: string;
    audioTranscription?: string;
    address: string;
    priority: string;
    status: string;
    comments: IComment[];
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



