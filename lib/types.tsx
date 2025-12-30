export type Paste = {
    content: string;
    created_at: number;
    expires_at: number | null;
    max_views: number | null;
    views: number;
};