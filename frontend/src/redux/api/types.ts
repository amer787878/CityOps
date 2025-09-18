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

export interface IssueUpdateRequest {
    description: string;
    photo?: File;
    audio?: File;
    address: string;
}

export interface TeamCreateRequest {
    name: string;
    image: string;
    members: Array<string>;
    category: string;
    availability: string;
}

export interface TeamCreateFormFields {
    name: string;
    image: FileList | null;
    category: string;
    availability: string;
    members: { value: string; label: string }[];
}

export interface TeamMember {
    _id: string;
    fullname: string;
}

export interface TeamUpdateRequest {
    name: string;
    image: string;
    members: Array<string>;
    category: string;
    availability: string;
}

export interface IIssue {
    _id: number;
    description: string;
    address: string;
    priority: string;
    status: string;
    dateSubmitted: string;
    upvotes: number;
    upvoteCount: number;
}

export interface IIssueDetail {
    _id: number;
    description: string;
    address: string;
    priority: string;
    status: string;
    dateSubmitted: string;
    upvotes: number;
    upvoteCount: number;
    createdBy: {
      _id: number;
      fullname: string;
      email: string;
      role: string;
    };
  }

export interface ITeamIssue {
    _id: number;
    description: string;
    address: string;
    priority: string;
    status: string;
    dateSubmitted: string;
    upvotes: number;
    upvoteCount: number;
}

export interface IComment {
    _id: string;
    issueId: string;
    author: string;
    timestamp: string;
    content: string;
}

export interface ITeam {
    _id: string;
    name: string;
    image: string;
    members: string[];
    category: string;
    availability: string;
    teamNumber: number;
    createdAt: string;
    updatedAt?: string;
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

export interface TeamType {
    name: string;
    category: string;
    availability: string;
    members: Array<string>;
};

export interface IUserRequest {
    fullname: string;
    email: string;
    role: 'Admin' | 'Authority' | 'Citizen';
    status: 'Active' | 'Pending' | 'Suspended';
}


export interface ITeamAssignRequest {
    issueId: string;
    teamId: string;
}

export interface ProfileRequest {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
}

export interface INotification {
    _id: string;
    message: string;
    user: string;
    issue: string;
    read: boolean;
}



