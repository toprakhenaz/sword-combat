"use client"
import React, { type ReactElement } from "react"

interface TableElementProps {
  className?: string
  children?: React.ReactNode
}

export default function AdminTable({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cloneWithProps = (element: ReactElement, props: Partial<TableElementProps>) => {
    return React.cloneElement(element, {
      ...(element.props as TableElementProps),
      ...props,
    })
  }

  return (
    <div
      className={`w-full max-w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-x-auto shadow-xl ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <table className="min-w-[600px] w-full divide-y divide-gray-800/50">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child

          if (child.type === "thead") {
            return cloneWithProps(child, {
              className: "bg-gray-800/30",
              children: React.Children.map(child.props.children, (trChild) => {
                if (!React.isValidElement(trChild) || trChild.type !== "tr") return trChild
                return cloneWithProps(trChild, {
                  children: React.Children.map(trChild.props.children, (thChild) => {
                    if (!React.isValidElement(thChild) || thChild.type !== "th") return thChild
                    return cloneWithProps(thChild, {
                      className: "px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider",
                    })
                  }),
                })
              }),
            })
          }

          if (child.type === "tbody") {
            return cloneWithProps(child, {
              className: "bg-gray-900/20 divide-y divide-gray-800/30",
              children: React.Children.map(child.props.children, (trChild) => {
                if (!React.isValidElement(trChild) || trChild.type !== "tr") return trChild
                return cloneWithProps(trChild, {
                  className: "hover:bg-gray-800/30 transition-colors duration-200",
                  children: React.Children.map(trChild.props.children, (tdChild) => {
                    if (!React.isValidElement(tdChild) || tdChild.type !== "td") return tdChild
                    return cloneWithProps(tdChild, {
                      className: "px-6 py-4 whitespace-nowrap text-sm text-gray-300",
                    })
                  }),
                })
              }),
            })
          }

          return child
        })}
      </table>
    </div>
  )
}
