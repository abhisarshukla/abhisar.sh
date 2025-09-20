import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { CollectionEntry } from "astro:content";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface GradientParams {
    height: number;
    colors: string[];
    positions: number;
    waveX: number;
    waveXShift: number;
    waveY: number;
    waveYShift: number;
    mixing: number;
    grainMixer: number;
    grainOverlay: number;
    offsetX: number;
    offsetY: number;
    scale: number;
    rotation: number;
}

/**
 * Generates a unique seed based on text content
 */
function generateSeed(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator
 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

/**
 * Maps a value from one range to another
 */
function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Converts HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    const red = Math.round((r + m) * 255);
    const green = Math.round((g + m) * 255);
    const blue = Math.round((b + m) * 255);

    return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

/**
 * Analyzes text sentiment and complexity
 */
function analyzeText(text: string) {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const uniqueWords = new Set(words);

    // Sentiment analysis based on word characteristics
    const energeticWords = ['amazing', 'exciting', 'incredible', 'fantastic', 'awesome', 'brilliant', 'dynamic', 'vibrant', 'powerful', 'innovative'];
    const calmWords = ['peaceful', 'serene', 'gentle', 'quiet', 'soft', 'minimal', 'simple', 'clean', 'zen', 'meditative'];
    const technicalWords = ['algorithm', 'code', 'programming', 'development', 'technical', 'system', 'api', 'framework', 'architecture', 'optimization'];
    const creativeWords = ['design', 'art', 'creative', 'visual', 'aesthetic', 'beautiful', 'artistic', 'inspiration', 'imaginative', 'expressive'];

    let energy = 0;
    let calmness = 0;
    let technical = 0;
    let creative = 0;

    words.forEach(word => {
        if (energeticWords.some(ew => word.includes(ew))) energy++;
        if (calmWords.some(cw => word.includes(cw))) calmness++;
        if (technicalWords.some(tw => word.includes(tw))) technical++;
        if (creativeWords.some(cw => word.includes(cw))) creative++;
    });

    return {
        wordCount: words.length,
        uniqueWordRatio: uniqueWords.size / words.length,
        averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
        energy: energy / words.length,
        calmness: calmness / words.length,
        technical: technical / words.length,
        creative: creative / words.length,
        complexity: Math.min(1, uniqueWords.size / 100) // Normalize to 0-1
    };
}

/**
 * Generates artistic gradient parameters based on blog content
 */
export function generateBlogGradient(blog: CollectionEntry<"blog">, content?: string): GradientParams {
    const { title, description, pubDate } = blog.data;
    const fullText = `${title} ${description} ${content || ''}`;

    // Create a unique seed from the blog content
    const seed = generateSeed(fullText);
    const random = seededRandom(seed);

    // Analyze text characteristics
    const analysis = analyzeText(fullText);

    // Date-based variations (seasonal colors)
    const month = pubDate.getMonth();
    const dayOfYear = Math.floor((pubDate.getTime() - new Date(pubDate.getFullYear(), 0, 0).getTime()) / 86400000);
    const seasonalHue = (dayOfYear / 365) * 360;

    // Generate base hue from title
    const titleSeed = generateSeed(title);
    const baseHue = (titleSeed % 360);

    // Determine dominant theme
    const themes = {
        technical: analysis.technical,
        creative: analysis.creative,
        energetic: analysis.energy,
        calm: analysis.calmness
    } as const;
    type ThemeKey = keyof typeof themes;
    const dominantTheme = (Object.keys(themes) as ThemeKey[]).reduce((a, b) => themes[a] > themes[b] ? a : b);

    // Color palette generation based on theme and content
    const colors: string[] = [];

    // Always start with a dark base
    colors.push('#000000');

    // Generate theme-based colors
    switch (dominantTheme) {
        case 'technical':
            // Blue-green tech palette
            colors.push(hslToHex((baseHue + 200) % 360, 0.6, 0.1)); // Deep blue-green
            colors.push(hslToHex((baseHue + 180) % 360, 0.4, 0.5)); // Muted cyan
            colors.push(hslToHex((baseHue + 160) % 360, 0.8, 0.3)); // Bright accent
            break;
        case 'creative':
            // Warm artistic palette
            colors.push(hslToHex((baseHue + 30) % 360, 0.7, 0.15)); // Deep warm
            colors.push(hslToHex((baseHue + 60) % 360, 0.6, 0.4)); // Golden mid
            colors.push(hslToHex((baseHue + 45) % 360, 0.9, 0.6)); // Bright highlight
            break;
        case 'energetic':
            // High contrast vibrant palette
            colors.push(hslToHex((baseHue + 120) % 360, 0.8, 0.2)); // Deep contrast
            colors.push(hslToHex((baseHue + 240) % 360, 0.7, 0.4)); // Vibrant mid
            colors.push(hslToHex(baseHue, 0.9, 0.7)); // Bright primary
            break;
        case 'calm':
        default:
            // Muted peaceful palette (similar to original)
            colors.push(hslToHex((seasonalHue + 120) % 360, 0.3, 0.12)); // Seasonal dark
            colors.push(hslToHex((baseHue + 30) % 360, 0.2, 0.55)); // Muted warm
            colors.push(hslToHex((baseHue + 60) % 360, 0.4, 0.4)); // Gentle accent
            break;
    }

    // Dynamic parameters based on content analysis
    const complexity = analysis.complexity;
    const energy = Math.max(analysis.energy, 0.1);
    const calmness = Math.max(analysis.calmness, 0.1);

    return {
        height: 500,
        colors,
        positions: Math.floor(mapRange(analysis.uniqueWordRatio, 0, 1, 20, 80)), // More unique words = more positions
        waveX: mapRange(energy, 0, 1, 0.2, 0.8), // Higher energy = more wave movement
        waveXShift: random() * 2 - 1, // Random shift
        waveY: mapRange(calmness, 0, 1, 0.5, 1.5), // Calmness affects vertical waves
        waveYShift: random() * 2 - 1, // Random shift
        mixing: mapRange(complexity, 0, 1, 0, 0.4), // Complex content = more mixing
        grainMixer: mapRange(analysis.technical, 0, 1, 0.2, 0.6), // Technical content = more grain
        grainOverlay: mapRange(analysis.creative, 0, 1, 0.5, 0.9), // Creative content = more overlay
        offsetX: (random() - 0.5) * 0.4, // Slight random offset
        offsetY: (random() - 0.5) * 0.4, // Slight random offset
        scale: mapRange(analysis.averageWordLength, 3, 12, 0.8, 1.4), // Word length affects scale
        rotation: mapRange(title.length, 5, 50, -15, 15) // Title length affects rotation
    };
}