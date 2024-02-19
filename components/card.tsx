import cn from "clsx";
import Link from "next/link"

var classes = {
    card: cn(
      "nextra-card nx-group nx-flex nx-flex-col nx-justify-start nx-overflow-hidden nx-rounded-lg nx-border nx-border-gray-200",
      "nx-text-current nx-no-underline dark:nx-shadow-none",
      "hover:nx-shadow-gray-100 dark:hover:nx-shadow-none nx-shadow-gray-100",
      "active:nx-shadow-sm active:nx-shadow-gray-200",
      "nx-transition-all nx-duration-200 hover:nx-border-gray-300",
      "nx-bg-transparent nx-shadow-sm dark:nx-border-neutral-800 hover:nx-bg-slate-50 hover:nx-shadow-md dark:hover:nx-border-neutral-700 dark:hover:nx-bg-neutral-900",
      "nx-p-4"
    ),
    title: cn(
      "nx-flex nx-font-semibold nx-items-start nx-gap-2 nx-text-gray-700 hover:nx-text-gray-900",
      "dark:nx-text-neutral-200 dark:hover:nx-text-neutral-50 nx-flex nx-items-center"
    ),
    content: cn("nx-line-clamp-3 nx-mt-2 nx-text-sm nx-font-normal nx-text-gray-500")
  };

export function Card ({ href, title, children, arrow }) {

    const arrowEl = <span className="nx-transition-transform nx-duration-75 group-hover:nx-translate-x-[2px]">{"\u2192"}</span>

    return <div className={classes.card}>
        <Link href={href}>
            <span className={classes.title}>{title}{arrow && arrowEl}</span>
            
            <div className={classes.content}>{children}</div>
        </Link>
    </div>
}

export default Card;