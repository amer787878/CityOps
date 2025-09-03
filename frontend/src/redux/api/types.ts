export interface GenericResponse {
    status: string;
    message: string;
}

export interface IUser {
    fullname: string;
    email: string;
    lastLogin: string;
    role: string;
    status: string;
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

export interface UserType {
    fullname: string;
    email: string;
    role: string;
    status: string;
};

export interface IUserRequest {
    fullname: string;
    email: string;
    role: 'Admin' | 'Authority' | 'Citizen';
    status: 'Active' | 'Pending' | 'Suspended';
}

export interface ProfileRequest {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
}



