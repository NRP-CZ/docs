import cn from "clsx";
import styles from './badge.module.css'

export function Badge ({ variant = 'default', children }) {

    let variantStyle;
    switch (variant) {
        case 'default': {
            variantStyle = "x:bg-primary-100 x:text-primary-800 dark:x:bg-blue-900 dark:x:text-blue-300"
            break
        }
        case 'dark': {
            variantStyle = "x:bg-gray-100 x:text-gray-800 dark:x:bg-gray-300 dark:x:text-gray-600"
            break
        }
        case 'red': {
            variantStyle = "x:bg-red-100 x:text-red-500 dark:x:bg-red-600 dark:x:text-gray-600"
            break
        }
        case 'green': {
            variantStyle = "x:bg-green-100 x:text-green-800 dark:x:bg--900 dark:x:text-green-300"
            break
        }
        case 'yellow': {
            variantStyle = "x:bg-yellow-100 x:text-yellow-800 dark:x:bg-yellow-900 dark:x:text-yellow-300"
            break
        }
        default: throw new Error(`Unknown badge variant ${variant}`)
    }

    return <span className={cn(variantStyle, 'x:border-solid x:border-black x:border x:text-sm x:font-medium x:me-2 x:mb-24 x:px-2.5 x:py-1 x:rounded', styles.badge)}>
        {children}
    </span>
}

export default Badge
