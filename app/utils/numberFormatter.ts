export const formatNumber = (num: number): string => {  
    if (num >= 10000000) 
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 100000) 
        return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}