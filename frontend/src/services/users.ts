export type User = {
    id: number;
    username: string;
    createdAt: string;
    updatedAt: string;
};

export async function getUser(username: string) {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${username}`
    );

    const data: User = await response.json();

    return {
        ok: response.ok,
        data,
    };
}