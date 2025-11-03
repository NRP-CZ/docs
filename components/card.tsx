import cn from "clsx";
import Link from "next/link"
import { Cards } from "nextra/components";

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
    return <Cards.Card title={title} arrow href={href}>
      <span className="x:flex x:items-center x:gap-2 x:p-4 x:text-gray-600 x:hover:text-gray-900 x:after:transition-transform x:after:duration-75 x:group-hover:after:translate-x-0.5 x:group-focus:after:translate-x-0.5 x:dark:text-gray-300 x:dark:hover:text-gray-100">
        {children}
      </span>
    </Cards.Card>
}

export default Card;