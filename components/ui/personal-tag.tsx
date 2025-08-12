"use client";

import React from "react";
import { Tooltip } from "./tooltip";

interface PersonalTag {
  text: string;
  url?: string;
  color?: string;
  tooltip?: string;
}

interface TagProps {
  tag: PersonalTag;
  index: number;
}

// 获取标签颜色样式
function getTagColorClass(color?: string, hasUrl?: boolean): string {
  const baseClasses = "transition-colors duration-200 h-6 leading-none"; // 添加固定高度
  const colorMap: Record<string, string> = {
    blue: hasUrl 
      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300 cursor-pointer dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:border-blue-700" 
      : "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    green: hasUrl 
      ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300 cursor-pointer dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 dark:border-green-700"
      : "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    purple: hasUrl 
      ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 dark:border-purple-700"
      : "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
    red: hasUrl 
      ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-300 cursor-pointer dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 dark:border-red-700"
      : "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    orange: hasUrl 
      ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300 cursor-pointer dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50 dark:border-orange-700"
      : "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    default: hasUrl 
      ? "bg-muted text-muted-foreground hover:bg-muted/80 border-border cursor-pointer"
      : "bg-muted text-muted-foreground border-border",
  };
  const defaultColor = hasUrl 
    ? "bg-muted text-muted-foreground hover:bg-muted/80 border-border cursor-pointer"
    : "bg-muted text-muted-foreground border-border";
  
  return `${baseClasses} ${colorMap[color || "default"] || defaultColor}`;
}

export function PersonalTag({ tag, index }: TagProps) {
  const hasUrl = !!tag.url;
  const Component = hasUrl ? 'a' : 'span';
  const props = hasUrl ? {
    href: tag.url,
    target: "_blank" as const,
    rel: "noopener noreferrer"
  } : {};

  const tagElement = (
    <Component
      {...props}
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getTagColorClass(tag.color, hasUrl)}`}
    >
      {tag.text}
    </Component>
  );

  if (tag.tooltip) {
    return (
      <Tooltip 
        key={index} 
        content={tag.tooltip} 
        delay={50}
        className="inline-block"
      >
        {tagElement}
      </Tooltip>
    );
  }

  return tagElement;
}
