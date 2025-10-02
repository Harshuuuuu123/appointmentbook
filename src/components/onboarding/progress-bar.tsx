interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full bg-muted rounded-full h-2 mb-8">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  )
}
