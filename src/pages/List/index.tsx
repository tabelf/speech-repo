import { useEffect, useState } from 'react'
import {
    Copy,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Check,
    X
} from 'lucide-react';
import { useScriptStore } from '@/store/scripts';
import { useNavigate } from 'react-router-dom';
import { useCategoryStore } from '@/store/categories';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DEFAULT_ALL, pageSize } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { useToastFeedback } from '@/hooks/useToastFeedback';

function List() {
    const { t } = useTranslation();
    const withToastFeedback = useToastFeedback();
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const navigate = useNavigate();

    const { scripts, total, loadScripts, deleteScript, deleteCategory, currentFilter, setCurrentFilter } = useScriptStore();
    const { categories, loadCategories } = useCategoryStore();

    useEffect(() => {
        loadScripts(currentPageNum, pageSize, currentFilter);
    }, [currentPageNum, currentFilter]);

    useEffect(() => {
        loadCategories();
    }, []);

    const totalPages = Math.ceil(total / pageSize);

    const goToPage = (page: number) => {
        setCurrentPageNum(page);
    };

    const copyScript = async (id: number, content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    const handleDeleteScript = async (id: number) => {
        await deleteScript(id, currentPageNum, pageSize, currentFilter);
    };

    const editScript = (id: number) => {
        navigate(`/create?id=${id}`);
    };

    // 更新所有设置filter的地方
    const handleFilterChange = (filter: string) => {
        setCurrentFilter(filter);
        setCurrentPageNum(1);
    };

    return (
        <>
            {/* Category Filters */}
            <div className="p-5 flex flex-wrap gap-2">
                <button
                    onClick={() => handleFilterChange(DEFAULT_ALL)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${currentFilter === DEFAULT_ALL
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg -translate-y-0.5'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {t('category.all')}
                </button>
                {categories.map(c => (
                    <button
                        onClick={() => handleFilterChange(c.name)}
                        className={`flex items-center gap-0.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${currentFilter === c.name
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg -translate-y-0.5'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {c.name}
                        {
                            currentFilter === c.name
                            && <ConfirmDialog
                                title={t('category.delete')}
                                description={t(total === 0 ? 'category.delete.confirm' : 'category.delete.confirm.withItems', {
                                    count: total
                                })}
                                onConfirm={() => withToastFeedback(() => deleteCategory(c.name))}
                                trigger={
                                    <X size={12} />
                                }
                                confirmText={t('dialog.confirm.title')}
                                cancelText={t('dialog.cancel.title')}
                            />
                        }
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto scrollbar-hidden">
                {/* Script List */}
                <div className="space-y-3 mb-5">
                    {scripts.map(script => (
                        <div
                            key={script.id}
                            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-black/5 transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div title={script.content} className="text-sm text-gray-850 leading-relaxed mb-3 line-clamp-2">
                                {script.content}
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                                <span className="px-2 py-1 rounded-sm text-xs bg-[#7161F6] text-white">
                                    {script.category}
                                </span>
                                {script.tags.map((tag) => (
                                    <span className={`px-2 py-1 rounded-sm text-xs bg-[#F5F3FF] text-[#7161F6]`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyScript(script.id!, script.content)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-emerald-600 hover:bg-emerald-50 transition-all hover:scale-105"
                                >
                                    {copiedId === script.id ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedId === script.id ? t('action.copied') : t('action.copy')}
                                </button>
                                <button
                                    onClick={() => editScript(script.id!)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-amber-600 hover:bg-amber-50 transition-all hover:scale-105"
                                >
                                    <Edit size={12} />
                                    <span>{t('action.edit')}</span>
                                </button>

                                <ConfirmDialog
                                    title={t('action.delete')}
                                    description={t('action.delete.confirm')}
                                    onConfirm={() => handleDeleteScript(script.id!)}
                                    trigger={
                                        <button className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-600 hover:bg-red-50 transition-all hover:scale-105">
                                            <Trash2 size={12} />
                                            <span>{t('action.delete')}</span>
                                        </button>
                                    }
                                    confirmText={t('dialog.confirm.title')}
                                    cancelText={t('dialog.cancel.title')}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <Pagination 
                totalPages={totalPages} 
                currentPageNum={currentPageNum} 
                goToPage={goToPage} />
        </>
    )
}

const Pagination = ({ totalPages, currentPageNum, goToPage }: { totalPages: number, currentPageNum: number, goToPage: (page: number) => void }) => {
    return (
        <>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 p-5">
                    <button
                        onClick={() => goToPage(currentPageNum - 1)}
                        disabled={currentPageNum === 1}
                        className="w-8 h-8 rounded bg-white/50 flex items-center justify-center transition-all hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* 生成页码和省略号 */}
                    {(() => {
                        const pages = [];
                        // 总页数不超过5页，直接显示所有页码
                        if (totalPages <= 5) {
                            for (let i = 1; i <= totalPages; i++) {
                                pages.push(
                                    <button
                                        key={i}
                                        onClick={() => goToPage(i)}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${currentPageNum === i
                                            ? 'bg-[#7161F6] text-white'
                                            : 'bg-white/50 hover:bg-indigo-100'
                                            }`}
                                    >
                                        {i}
                                    </button>
                                );
                            }
                        } else {
                            // 总页数超过5页，最多显示5个页码
                            // 显示第一页
                            pages.push(
                                <button
                                    key={1}
                                    onClick={() => goToPage(1)}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${currentPageNum === 1
                                        ? 'bg-[#7161F6] text-white'
                                        : 'bg-white/50 hover:bg-indigo-100'
                                        }`}
                                >
                                    1
                                </button>
                            );

                            // 如果当前页码大于2，添加第一个省略号
                            if (currentPageNum > 2) {
                                pages.push(
                                    <span key="ellipsis1" className="w-4 h-4 flex items-center justify-center text-xs text-gray-500">...</span>
                                );
                            }

                            // 确定要显示的中间页码范围
                            let startPage, endPage;
                            if (currentPageNum <= 2) {
                                // 当前页码靠近前面，显示页码2,3,4
                                startPage = 2;
                                endPage = 4;
                            } else if (currentPageNum >= totalPages - 1) {
                                // 当前页码靠近后面，显示页码totalPages-3, totalPages-2, totalPages-1
                                startPage = totalPages - 3;
                                endPage = totalPages - 1;
                            } else {
                                // 当前页码在中间，显示前一页、当前页、后一页
                                startPage = currentPageNum - 1;
                                endPage = currentPageNum + 1;
                            }

                            // 显示中间页码
                            for (let i = startPage; i <= endPage; i++) {
                                if (i > 1 && i < totalPages) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => goToPage(i)}
                                            className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${currentPageNum === i
                                                ? 'bg-[#7161F6] text-white'
                                                : 'bg-white/50 hover:bg-indigo-100'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                            }

                            // 如果当前页码小于totalPages-1，添加第二个省略号
                            if (currentPageNum < totalPages - 1) {
                                pages.push(
                                    <span key="ellipsis2" className="w-4 h-4 flex items-center justify-center text-xs text-gray-500">...</span>
                                );
                            }

                            // 显示最后一页
                            pages.push(
                                <button
                                    key={totalPages}
                                    onClick={() => goToPage(totalPages)}
                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${currentPageNum === totalPages
                                        ? 'bg-[#7161F6] text-white'
                                        : 'bg-white/50 hover:bg-indigo-100'
                                        }`}
                                >
                                    {totalPages}
                                </button>
                            );
                        }
                        return pages;
                    })()}

                    <button
                        onClick={() => goToPage(currentPageNum + 1)}
                        disabled={currentPageNum === totalPages}
                        className="w-8 h-8 rounded bg-white/50 flex items-center justify-center transition-all hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </>
    );
}

export default List