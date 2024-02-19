import Badge from "./badge";

export function Difficulty ({ level = 'easy' }) {

    const variant = level === 'easy' ? 'default' : level === 'intermediate' ? 'dark' : level === 'advanced' ? 'red' : 'default'

    return <Badge variant={variant}>{level}</Badge>
}