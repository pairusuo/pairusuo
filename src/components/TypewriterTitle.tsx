"use client";
import Typewriter from "typewriter-effect";

interface Props {
  strings: string[];
  className?: string; // Class for the wrapper
}

// @ts-ignore
// @ts-ignore
const GraphemeSplitter = (string: string): string[] => {
  // @ts-ignore
  const splitter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  // @ts-ignore
  return Array.from(splitter.segment(string)).map(({ segment }) => segment) as string[];
};

export const TypewriterTitle = ({ strings, className = "" }: Props) => {
  return (
    <span className={className}>
      <Typewriter
        options={{
          strings: strings,
          autoStart: true,
          loop: true,
          delay: 75,
          deleteSpeed: 50,
          stringSplitter: GraphemeSplitter,
        }}
      />
    </span>
  );
};
