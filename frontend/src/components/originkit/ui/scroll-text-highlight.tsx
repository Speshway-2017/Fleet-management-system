"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type FontStyle = React.CSSProperties;

type SplitBy = "characters" | "words";

type ScrollPosition =
    | "top top"
    | "top center"
    | "top bottom"
    | "center top"
    | "center center"
    | "center bottom"
    | "bottom top"
    | "bottom center"
    | "bottom bottom"
    | (string & {});

type ScrollHighlightProps = {
    text?: string;
    font?: FontStyle;

    dimColor?: string;
    highlightColor?: string;

    splitBy?: SplitBy;
    scrollStart?: ScrollPosition;
    scrollEnd?: ScrollPosition;
    scrub?: boolean;
    containerStyle?: React.CSSProperties;
};

const CHAR_STAGGER = 0.03;
const WORD_STAGGER = 0.1;

export default function ScrollHighlight({
    text = "Every word in this paragraph will light up as you scroll through it.",

    font = {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "60px",
        fontWeight: 600,
        letterSpacing: "-0.025em",
        lineHeight: "1.1em",
        textAlign: "left",
    },

    dimColor = "rgba(100, 116, 139, 0.35)",
    highlightColor = "#0B1B3D",

    splitBy = "words",
    scrollStart = "top 85%",
    scrollEnd = "bottom 45%",
    scrub = true,
    containerStyle = {},
}: ScrollHighlightProps) {
    const containerRef = useRef<HTMLParagraphElement>(null);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const chars = Array.from(text);
    const stagger = splitBy === "characters" ? CHAR_STAGGER : WORD_STAGGER;

    useEffect(() => {
        const paragraph = containerRef.current;
        if (!paragraph) return;

        const targets = paragraph.querySelectorAll(
            splitBy === "characters" ? ".char" : ".word"
        );

        const ctx = gsap.context(() => {
            gsap.set(targets, {
                color: dimColor,
            });

            gsap.to(targets, {
                color: highlightColor,
                stagger,
                scrollTrigger: {
                    trigger: paragraph,
                    start: scrollStart,
                    end: scrollEnd,
                    scrub,
                },
            });
        }, paragraph);

        return () => ctx.revert();
    }, [
        text,
        dimColor,
        highlightColor,
        splitBy,
        stagger,
        scrollStart,
        scrollEnd,
        scrub,
    ]);

    return (
        <div style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem", ...containerStyle }}>
            <p
                ref={containerRef}
                style={{
                    margin: 0,
                    display: "inline-block",
                    whiteSpace: "pre-wrap",
                    color: dimColor,
                    ...font,
                }}
            >
                {splitBy === "characters"
                    ? chars.map((char, index) => (
                          <span
                              key={`${char}-${index}`}
                              className="char"
                              style={{
                                  display: "inline-block",
                                  color: dimColor,
                              }}
                          >
                              {char === " " ? "\u00A0" : char}
                          </span>
                      ))
                    : words.map((word, index) => (
                          <React.Fragment key={`${word}-${index}`}>
                              <span
                                  className="word"
                                  style={{
                                      display: "inline-block",
                                      color: dimColor,
                                  }}
                              >
                                  {word}
                              </span>
                              {index < words.length - 1 ? " " : null}
                          </React.Fragment>
                      ))}
            </p>
        </div>
    );
}