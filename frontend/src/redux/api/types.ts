export interface GenericResponse {
    status: string;
    message: string;
}

export interface IUser {
    _id: string;
    username: string; // Added this property
    avatar: string;
    lastMessage?: {
      content: string;
      createdAt: string;
    };
    unreadCount: number; // Added this property
    fullname: string;
    email: string;
    lastLogin: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  

export interface RegisterUserRequest {
    fullname: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role: 'Citizen' | 'Authority' | 'Admin';
    authority?: string; // Required only if role is 'Citizen'
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
    category: string;
    priority: string;
}

export interface IssueUpdateRequest {
    description: string;
    photo?: File;
    audio?: File;
    address: string;
    category: string;
    priority: string;
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
    _id: string;
    description: string;
    address: string;
    priority: string;
    status: string;
    dateSubmitted: string;
    issueNumber: number;
    upvotes: number;
    category: string;
    upvoteCount: number;
    createdAt: string;
    photoUrl: string;
    audioUrl: string;
}

export interface IIssueDetail {
    _id: string;
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
    _id: string;
    description: string;
    address: string;
    priority: string;
    status: string;
    dateSubmitted: string;
    upvotes: number;
    issueNumber: number;
    upvoteCount: number;
    category: string;
}

export interface IComment {
    _id: string;
    issueId: string;
    author: string;
    timestamp: string;
    content: string;
    notificationType: string;
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

export interface PendingSubmission {
    _id: string;
    description: string;
    userName: string;
    issueNumber: number;
    photoUrl?: string;
    createdBy: {
        _id: number;
        fullname: string;
        email: string;
        role: string;
    };
}

export interface ReportedComment {
    _id: string;
    content: string;
    issueId: string;
    flagReason: string;
    userName: string;
    issue: {
        _id: number;
        issueNumber: string;
    };
    createdBy: {
        _id: number;
        fullname: string;
        email: string;
        role: string;
    };
}



