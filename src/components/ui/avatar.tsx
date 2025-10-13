import React from "react"

interface AvatarProps {
  children: React.ReactNode
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({ children, className }) => {
  return <div className={`inline-flex overflow-hidden rounded-full ${className}`}>{children}</div>
}

interface AvatarImageProps {
  src: string
  alt?: string
  className?: string
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={`object-cover ${className}`} />
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className }) => {
  return <span className={`flex items-center justify-center bg-gray-200 text-gray-700 ${className}`}>{children}</span>
}
