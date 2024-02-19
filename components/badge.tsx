import cn from "clsx";
import styles from './badge.module.css'

export function Badge ({ variant = 'default', children }) {

    let variantStyle;
    switch (variant) {
        case 'default': {
            variantStyle = "nx-bg-primary-100 nx-text-primary-800 dark:nx-bg-blue-900 dark:nx-text-blue-300"
            break
        }
        case 'dark': {
            variantStyle = "nx-bg-gray-100 nx-text-gray-800 dark:nx-bg-gray-300 dark:nx-text-gray-600"
            break
        }
        case 'red': {
            variantStyle = "nx-bg-red-100 nx-text-red-500 dark:nx-bg-red-600 dark:nx-text-gray-600"
            break
        }
        case 'green': {
            variantStyle = "nx-bg-green-100 nx-text-green-800 dark:nx-bg--900 dark:nx-text-green-300"
            break
        }
        case 'yellow': {
            variantStyle = "nx-bg-yellow-100 nx-text-yellow-800 dark:nx-bg-yellow-900 dark:nx-text-yellow-300"
            break
        }
        default: throw new Error(`Unknown badge variant ${variant}`)
    }

    return <span className={cn(variantStyle, 'nx-text-sm nx-font-medium nx-me-2 nx-mb-12 nx-px-2.5 nx-py-0.5 nx-rounded', styles.badge)}>
        {children}
    </span>
}

export default Badge
