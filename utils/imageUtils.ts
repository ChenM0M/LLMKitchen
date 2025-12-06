
/**
 * 将图片 URL 转换为 Base64 字符串，并进行缩放以节省存储空间
 * @param url 图片 URL
 * @param maxWidth 最大宽度 (默认 300px，适合卡片展示)
 * @returns 缩放后的 Base64 字符串
 */
export const urlToBase64 = async (url: string, maxWidth = 300): Promise<string> => {
    // 如果已经是 data URL，直接返回 (后续可以考虑是否需要压缩)
    if (url.startsWith('data:')) return url;

    try {
        // 使用 fetch 获取图片数据 (解决 CORS 跨域问题，前提是服务器支持)
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const img = new Image();
            // 关键：允许跨域加载
            img.crossOrigin = 'Anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 计算缩放比例
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }

                // 启用高质量缩放
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);

                // 转换为 JPEG 格式，质量 0.8 (兼顾质量和体积)
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };

            img.onerror = (e) => {
                console.warn('Image loading for base64 failed', e);
                // 失败时返回原 URL，虽然可能无法持久化
                resolve(url);
            };

            // 创建本地 URL
            img.src = URL.createObjectURL(blob);
        });
    } catch (e) {
        console.error('Image conversion failed', e);
        return url; // 失败前回退到原 URL
    }
};
