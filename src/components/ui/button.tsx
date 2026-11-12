import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  [
    "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap rounded-lg transition-all disabled:pointer-events-none disabled:border-0 disabled:bg-gray-100 disabled:text-gray-700 disabled:select-none",

    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-6 shrink-0 [&_svg]:shrink-0",
    "outline-none focus-visible:border-ring focus-visible:ring-black focus-visible:ring-[1.5px]",
    "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
    "disabled:!pointer-events-none disabled:!border-0 disabled:!bg-gray-100 dark:disabled:!bg-gray-700 disabled:!text-gray-500 dark:disabled:!text-gray-400 disabled:!bg-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 dark:hover:bg-destructive/80",
        outline:
          "bg-background border border-gray-200 text-foreground hover:bg-gray-100 hover:text-accent-foreground dark:bg-slate-600 dark:border-slate-700 dark:hover:bg-slate-700",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80",
        ghost:
          "hover:bg-transparent hover:text-accent-foreground dark:hover:bg-transparent data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary",
        download:
          "bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400",
        dangers:
          "text-red-500 bg-red-50 rounded-[8px] py-3 px-4 gap-2 dark:bg-red-900/20 dark:text-red-400",
        primary:
          "text-white bg-blue-500 hover:bg-blue-600 rounded-[8px] px-4 gap-2 dark:bg-blue/50 dark:hover:bg-blue-700",
        newPrimary:
          "text-white bg-blue-500 rounded-[8px] py-3 px-4 gap-2 dark:bg-blue-600 dark:hover:bg-blue-700",
        success:
          "text-white bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400",
        warning:
          "text-orange-500 bg-orange-50 rounded-[8px] py-3 px-4 gap-2 dark:bg-orange-900/20 dark:text-orange-400",
        softDangers:
          "text-white bg-red-50 dark:bg-red-900/20 dark:text-red-400",
        boldWarning:
          "text-white bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700",
        primaryPagination:
          "text-white bg-blue-50 text-blue-500 border border-blue-100 border-[1px] dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700",
        plain: "text-black bg-gray-50 dark:bg-gray-800 dark:text-gray-200",
        red: "text-white bg-red-500 rounded-[8px] py-3 px-4 gap-2 dark:bg-red-600 dark:hover:bg-red-700",
        gray: "text-black bg-gray-100 dark:bg-gray-700 dark:text-gray-200",
        grayDark:
          "text-white bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700",
        greenDark:
          "text-white bg-green-500 dark:bg-green-600 dark:hover:bg-green-700",
        blueBca: "text-white bg-[#5385D3] dark:bg-[#5385D3]",
        outlineRed:
          "border-2 border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20",
        purple:
          "text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
        bluelight: [
          "bg-blue-300 text-blue-50",
          "hover:bg-blue-300 dark:bg-blue-400 dark:text-blue-50 dark:hover:bg-blue-400",
        ].join(" "),
        gradient: [
          "text-white",
          "bg-[linear-gradient(90deg,#1874A5,#A31AF2)]",
          "hover:bg-[linear-gradient(0deg,#ffffff33_0%,#ffffff33_100%),linear-gradient(283deg,#A31AF2_6%,#1874A5_97%)]",
          "active:bg-[linear-gradient(0deg,#00000033_0%,#00000033_100%),linear-gradient(283deg,#A31AF2_6%,#1874A5_97%)]",
        ].join(" "),
        gradienHover: [
          "text-black",
          "bg-white",
          "hover:bg-[linear-gradient(0deg,#ffffff33_0%,#ffffff33_100%),linear-gradient(283deg,#A31AF2_6%,#1874A5_97%)] hover:text-white",
          "active:bg-[linear-gradient(0deg,#00000033_0%,#00000033_100%),linear-gradient(283deg,#A31AF2_6%,#1874A5_97%)]",
        ].join(" "),
        blue: "bg-blue-500 hover:bg-blue-600 text-white rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700",
        lightBlue:
          "bg-primary-50 text-primary-500 dark:bg-blue-900/20 dark:text-blue-400",
        icon: "p-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:border-gray-300 text-gray-400 data-[state=open]:bg-gray-100 data-[state=open]:border-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:text-gray-400 dark:data-[state=open]:bg-gray-700 dark:data-[state=open]:border-gray-600",
        iconView:
          "w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#1F5AA6] hover:bg-[#EFF4FB] dark:hover:bg-[#1F5AA6]/20 text-gray-200 dark:text-gray-600 hover:text-[#1F5AA6] dark:hover:text-[#1F5AA6]/20 text-gray-400 hover:text-[#1F5AA6] transition-all",
        iconDelete:
          "w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-all",
        iconEdit:
          "w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-400 hover:text-orange-600 transition-all",
      },
      intent: {
        edit: "hover:border-orange-500 hover:bg-orange-50  hover:text-orange-500  hover:shadow-none active:bg-orange-50 dark:hover:border-orange-500 dark:hover:bg-orange-100 dark:hover:text-orange-500 dark:active:bg-orange-100",
        delete:
          "hover:border-red-500 hover:bg-red-50 hover:text-red-500 hover:shadow-none active:bg-red-50 dark:hover:border-red-500 dark:hover:bg-red-100 dark:hover:text-red-500 dark:active:bg-red-100",
        view: "hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500 hover:shadow-none active:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-100 dark:hover:text-blue-500 dark:active:bg-blue-100",
        info: "hover:border-purple-500 hover:bg-purple-50 hover:text-purple-500 hover:shadow-none active:bg-purple-50 dark:hover:border-purple-500 dark:hover:bg-purple-100 dark:hover:text-purple-500 dark:active:bg-purple-100",
        primary:
          "hover:border-blue-500   hover:bg-blue-50    hover:text-blue-500    hover:shadow-none active:bg-blue-50 dark:hover:border-blue-500 dark:hover:bg-blue-100 dark:hover:text-blue-500 dark:active:bg-blue-100",
        lock: "hover:border-orange-500   hover:bg-orange-50   hover:text-orange-600    hover:shadow-none active:bg-orange-50 dark:hover:border-orange-500 dark:hover:bg-orange-100 dark:hover:text-orange-600 dark:active:bg-orange-200",
        key: "hover:border-amber-500  hover:bg-amber-50   hover:text-amber-500   hover:shadow-none active:bg-amber-50 dark:hover:border-amber-500 dark:hover:bg-amber-100 dark:hover:text-amber-500 dark:active:bg-amber-100",
        success:
          "hover:border-green-500  hover:bg-green-50   hover:text-green-500   hover:shadow-none active:bg-green-50 dark:hover:border-green-500 dark:hover:bg-green-100 dark:hover:text-green-500 dark:active:bg-green-100",
        warning:
          "hover:border-yellow-500 hover:bg-yellow-50  hover:text-yellow-500  hover:shadow-none active:bg-yellow-50 dark:hover:border-yellow-500 dark:hover:bg-yellow-100 dark:hover:text-yellow-500 dark:active:bg-yellow-100",
        purple:
          "hover:border-purple-500 hover:bg-purple-50  hover:text-purple-500  hover:shadow-none active:bg-purple-50 dark:hover:border-purple-500 dark:hover:bg-purple-100 dark:hover:text-purple-500 dark:active:bg-purple-100",
        // add more intents icon colors as needed
      },
      size: {
        default: "h-[40px] text-[14px]",
        icon: "h-8 w-8 p-0 [&_svg:not([class*='size-'])]:size-4",
        s: "h-[26px] text-[10px] px-2",
        xs: "h-[32px] text-[12px]",
        sm: "h-[32px] text-[12px]",
        md: "h-[44px] text-[14px]",
        lg: "h-[52px] text-[16px]",
        iconS: "[&_svg:not([class*='size-'])]:size-3.5",
        iconSm: "[&_svg:not([class*='size-'])]:size-5",
        iconMd: "[&_svg:not([class*='size-'])]:size-6",
        iconLg: "[&_svg:not([class*='size-'])]:size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    text?: React.ReactNode;
    icon?: React.ReactNode;
    load?: boolean;
    asChild?: boolean;
    iconPosition?: "left" | "right";
    href?: string;
    label?: string;
  };

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className,
      variant,
      size,
      intent,
      text,
      icon,
      load = false,
      asChild = false,
      label,
      iconPosition = "left",
      href,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp: React.ElementType = asChild ? Slot : href ? Link : "button";

    return (
      <Comp
        ref={ref as any}
        className={cn(buttonVariants({ variant, size, intent }), className)}
        {...(href ? { to: href } : {})}
        {...props}
      >
        {load ? (
          <Loader2 className="animate-spin size-5" />
        ) : children ? (
          children
        ) : iconPosition === "right" ? (
          <>
            {label ?? text}
            {icon}
          </>
        ) : (
          <>
            {icon}
            {label ?? text}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export const IconButton = Button;

export { buttonVariants };
