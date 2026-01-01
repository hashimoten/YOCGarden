
export type TreeLevel = '若木' | '中木' | '大木' | '伝説の木';

export interface TreeLevelInfo {
    level: TreeLevel;
    label: string;
    englishLabel: string;
    description: string;
    threshold: number; // Minimum YOC required
    image: string;
}

export const TREE_LEVELS: Record<TreeLevel, TreeLevelInfo> = {
    '若木': {
        level: '若木',
        label: '若木',
        englishLabel: 'Young Tree',
        description: 'これから成長する木',
        threshold: 0,
        image: '/trees/YoungTree.png'
    },
    '中木': {
        level: '中木',
        label: '中木',
        englishLabel: 'Growing Tree',
        description: '順調に育っている木',
        threshold: 3.0,
        image: '/trees/GrowingTree.png'
    },
    '大木': {
        level: '大木',
        label: '大木',
        englishLabel: 'Core Holding',
        description: 'ポートフォリオの柱',
        threshold: 5.0,
        image: '/trees/CoreHolding.png'
    },
    '伝説の木': {
        level: '伝説の木',
        label: '伝説の木',
        englishLabel: 'Legendary Tree',
        description: '計り知れない価値を持つ木',
        threshold: 10.0,
        image: '/trees/LegendaryTree.png'
    }
};

export const getTreeLevel = (yoc: number): TreeLevelInfo => {
    if (yoc >= TREE_LEVELS['伝説の木'].threshold) return TREE_LEVELS['伝説の木'];
    if (yoc >= TREE_LEVELS['大木'].threshold) return TREE_LEVELS['大木'];
    if (yoc >= TREE_LEVELS['中木'].threshold) return TREE_LEVELS['中木'];
    return TREE_LEVELS['若木'];
};
