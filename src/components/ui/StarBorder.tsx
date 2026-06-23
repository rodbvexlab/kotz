import './StarBorder.css'

interface StarBorderProps {
  as?: keyof JSX.IntrinsicElements
  className?: string
  color?: string
  speed?: string
  thickness?: number
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#FF6500',
  speed = '5s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps) => {
  const ComponentElement = Component as any
  return (
    <ComponentElement
      className={`star-border-container ${className}`}
      style={{ padding: `${thickness}px 0`, ...((rest as any).style) }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      />
      <div className="inner-content">{children}</div>
    </ComponentElement>
  )
}

export default StarBorder
