import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border-0 p-6 pr-8 shadow-2xl backdrop-blur-none transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700",
        destructive: "bg-red-600 text-white shadow-red-200 dark:shadow-red-900/20",
        success: "bg-green-600 text-white shadow-green-200 dark:shadow-green-900/20",
        warning: "bg-yellow-600 text-white shadow-yellow-200 dark:shadow-yellow-900/20",
        info: "bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-white flex-shrink-0" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
      case "info":
        return <Info className="h-5 w-5 text-white flex-shrink-0" />
      default:
        return <Info className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
    }
  }

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start space-x-3 w-full">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {props.children}
        </div>
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border-0 bg-gray-100 dark:bg-gray-700 px-3 text-sm font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:bg-red-500/20 group-[.destructive]:hover:bg-red-500/30 group-[.destructive]:text-red-100 group-[.destructive]:hover:text-white group-[.success]:bg-green-500/20 group-[.success]:hover:bg-green-500/30 group-[.success]:text-green-100 group-[.success]:hover:text-white group-[.warning]:bg-yellow-500/20 group-[.warning]:hover:bg-yellow-500/30 group-[.warning]:text-yellow-100 group-[.warning]:hover:text-white group-[.info]:bg-blue-500/20 group-[.info]:hover:bg-blue-500/30 group-[.info]:text-blue-100 group-[.info]:hover:text-white",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 group-[.destructive]:text-red-200 group-[.destructive]:hover:text-white group-[.destructive]:hover:bg-red-500/20 group-[.destructive]:focus:ring-red-400 group-[.success]:text-green-200 group-[.success]:hover:text-white group-[.success]:hover:bg-green-500/20 group-[.success]:focus:ring-green-400 group-[.warning]:text-yellow-200 group-[.warning]:hover:text-white group-[.warning]:hover:bg-yellow-500/20 group-[.warning]:focus:ring-yellow-400 group-[.info]:text-blue-200 group-[.info]:hover:text-white group-[.info]:hover:bg-blue-500/20 group-[.info]:focus:ring-blue-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold text-gray-900 dark:text-white group-[.destructive]:text-white group-[.success]:text-white group-[.warning]:text-white group-[.info]:text-white", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-300 group-[.destructive]:text-red-100 group-[.success]:text-green-100 group-[.warning]:text-yellow-100 group-[.info]:text-blue-100", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
