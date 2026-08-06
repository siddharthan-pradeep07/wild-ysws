export function isAdminUser(email: string | undefined | null): boolean 
{
    if (!email) 
    {
        return false;
    }
    
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

    return adminEmails.includes(email.toLowerCase());
}