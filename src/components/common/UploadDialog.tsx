import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger,
} from "@/components/ui/file-upload";
import { FileDown, Upload, X } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from 'xlsx';

/**
 * UploadDialog component - A dialog for file uploads with drag and drop support
 * Uses FileUpload components to handle file selection, validation, and preview
 */
export default function UploadDialog({
    open,
    onOpenChange,
    title = "Upload Files",
    onUploadComplete,
    onClose,
    accept = "image/*",
}: UploadDialogProps) {
    const { t } = useTranslation();
    const [files, setFiles] = React.useState<File[]>([]);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null); // 添加错误消息状态

    React.useEffect(() => {
        // 当弹窗从关闭变为打开时，确保文件列表为空
        if (open) {
            setFiles([]);
            setErrorMessage(null);
        }
    }, [open]);
    
    // Handle dialog open state change
    const handleOpenChange = React.useCallback((isOpen: boolean) => {
        onOpenChange(isOpen);
        // Clear files when dialog closes
        if (!isOpen) {
            setFiles([]);
            setErrorMessage(null); // 关闭对话框时清除错误消息
            if (onClose) onClose();
        }
    }, [onOpenChange, onClose]);

    // File validation function
    const onFileValidate = React.useCallback(
        (file: File): string | null => {
            // Validate max files
            if (files.length >= 1) {
                return t("import.upload.num.require");
            }

            // Validate file size (max 2MB)
            const MAX_SIZE = 2 * 1024 * 1024; // 2MB
            if (file.size > MAX_SIZE) {
                return t("import.upload.size.require", { size: MAX_SIZE / (1024 * 1024) });
            }

            return null;
        },
        [files],
    );

    // Handle rejected files - 修改为更新错误状态而不是使用toast
    const onFileReject = React.useCallback((file: File, message: string) => {
        const fileName = file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name;
        setErrorMessage(`"${fileName}" ${message}`);
    }, []);

    // Handle file upload completion
    const handleComplete = () => {
        if (files.length > 0 && onUploadComplete) {
            onUploadComplete(files);
        }
        onOpenChange(false);
    };

    // 当文件列表变化时清除错误消息（再次上传时）
    const handleFilesChange = React.useCallback((newFiles: File[]) => {
        setFiles(newFiles);
        if (errorMessage) {
            setErrorMessage(null);
        }
    }, [errorMessage]);

    const handleDownloadTemplate = () => {
        // 创建模板数据
        const templateData = [
            {
                [t("export.title.content")]: t("import.upload.template.content"),
                [t("export.title.category")]: t("import.upload.template.category"),
                [t("export.title.tag")]: t("import.upload.template.tag"),
            }
        ];

        // 创建工作簿和工作表
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t("export.sheet.name"));

        // 生成Excel文件并下载
        XLSX.writeFile(workbook, `${t('import.upload.template.title')}.xlsx`);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {/* 添加下载Excel模板的部分 */}
                    <div
                        className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileDown className="size-5 text-blue-500" />
                            <span className="text-sm text-gray-700">{t('import.upload.template.title')}</span>
                        </div>
                        <span onClick={handleDownloadTemplate} className="text-xs text-blue-600 font-medium">{t('import.upload.template.download')}</span>
                    </div>
                    <FileUpload
                        value={files}
                        onValueChange={handleFilesChange} // 使用修改后的处理函数
                        onFileValidate={onFileValidate}
                        onFileReject={onFileReject}
                        accept={accept}
                        maxFiles={1}
                        className="w-full"
                        multiple
                    >
                        <FileUploadDropzone>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center justify-center rounded-full border-dotted p-2.5">
                                    <Upload className="size-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-sm">{t('import.upload.title')}</p>
                                <p className="text-muted-foreground text-xs">
                                    {t('import.upload.placeholder', { accept })}
                                </p>
                            </div>
                            <FileUploadTrigger asChild>
                                <Button variant="outline" size="sm" className="mt-2 w-fit">
                                    {t('import.upload.button')}
                                </Button>
                            </FileUploadTrigger>
                        </FileUploadDropzone>

                        {/* 显示错误消息 - 以红色字体显示在上传框下方 */}
                        {errorMessage && (
                            <div className="mt-2 text-red-500 text-sm animate-fadeIn">
                                {errorMessage}
                            </div>
                        )}

                        <FileUploadList>
                            {files.map((file) => (
                                <FileUploadItem key={file.name} value={file}>
                                    <FileUploadItemPreview />
                                    <FileUploadItemMetadata />
                                    <FileUploadItemDelete asChild>
                                        <Button variant="ghost" size="icon" className="size-7">
                                            <X />
                                        </Button>
                                    </FileUploadItemDelete>
                                </FileUploadItem>
                            ))}
                        </FileUploadList>
                    </FileUpload>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('dialog.cancel.title')}
                    </Button>
                    <Button
                        className="bg-[#7161F6] hover:bg-[#7161F6]"
                        onClick={handleComplete}
                        disabled={files.length === 0}
                    >
                        {t('import.upload.action')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}