import SingleInputDialog from '@/components/common/SingleInputDialog';
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useCategoryStore } from '@/store/categories';
import { useTagStore } from '@/store/tags';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [openTagsDialog, setOpenTagsDialog] = useState(false);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);

    const { addCategory } = useCategoryStore();
    const { addTag } = useTagStore();
    
    // 标签验证函数 - 检查是否包含中文或英文逗号
    const validateTag = (value: string): string | null => {
        if (value.includes(',') || value.includes('，')) {
            return '标签不能包含逗号';
        }
        return null;
    };

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 shadow-lg">
            <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">{t('header.title')}</p>
                <div className='flex gap-2.5 items-center'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/30 hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <Plus size={16} />
                                <span>{t('header.addMenu')}</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent forceMount={true}>
                            <DropdownMenuItem onClick={() => navigate('/create')}>{t('header.addMenu.speech')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setOpenCategoryDialog(true)}>{t('header.addMenu.category')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setOpenTagsDialog(true)}>{t('header.addMenu.tag')}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* 标签对话框添加验证 */}
                    <SingleInputDialog
                        open={openTagsDialog}
                        onOpenChange={setOpenTagsDialog}
                        title={t('dialog.tag.title')}
                        placeholder={t('dialog.tag.placeholder')}
                        onSubmit={(value) => addTag(value)}
                        validate={validateTag}
                    />

                    <SingleInputDialog
                        open={openCategoryDialog}
                        onOpenChange={setOpenCategoryDialog}
                        title={t('dialog.category.title')}
                        placeholder={t('dialog.category.placeholder')}
                        onSubmit={(value) => addCategory(value)}
                    />

                    
                </div>
            </div>
        </div>
    )
}

export default Header