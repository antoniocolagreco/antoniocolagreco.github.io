import clsx from "clsx"
import React from "react"

type ReactTestProps = React.HTMLAttributes<HTMLDivElement> & {}

const ReactTest = React.forwardRef<HTMLDivElement, ReactTestProps>((props, ref) => {
    const { className, ...rest } = props
    const [visible, setVisible] = React.useState(false)

    return (
        <div className={clsx("w-full p-4", className)} ref={ref} {...rest}>
            <button
                className="rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                onClick={() => {
                    setVisible((prev) => !prev)
                }}
            >
                Toggle
            </button>
            {visible && <div className="font-semibold">Visible</div>}
        </div>
    )
})

ReactTest.displayName = "ReactTest"

export default ReactTest
