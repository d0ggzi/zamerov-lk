import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentList from "./DocumentList.jsx";

const docs = [
    {id: "1", url: "https://s3/x/contract.pdf", name: "Договор.pdf", status: "NOT_SIGNED"},
    {id: "2", url: "https://s3/x/check.png", name: "Чек.png", status: "SIGNED"},
];

describe("DocumentList", () => {
    it("показывает пустой текст без документов", () => {
        render(<DocumentList documents={[]} emptyText="Пусто"/>);
        expect(screen.getByText("Пусто")).toBeInTheDocument();
    });

    it("рендерит ссылки на скачивание", () => {
        render(<DocumentList documents={docs}/>);
        const link = screen.getByText("Договор.pdf").closest("a");
        expect(link).toHaveAttribute("href", "https://s3/x/contract.pdf");
        expect(screen.getByText("Чек.png")).toBeInTheDocument();
    });

    it("показывает статус документа", () => {
        render(<DocumentList documents={docs}/>);
        expect(screen.getByText("Не подписан")).toBeInTheDocument();
        expect(screen.getByText("Подписан")).toBeInTheDocument();
    });

    it("не показывает кнопку удаления без onDelete", () => {
        render(<DocumentList documents={docs}/>);
        expect(screen.queryByText("Удалить")).not.toBeInTheDocument();
    });

    it("вызывает onDelete с документом", async () => {
        const onDelete = vi.fn();
        render(<DocumentList documents={docs} onDelete={onDelete}/>);
        await userEvent.click(screen.getAllByText("Удалить")[0]);
        expect(onDelete).toHaveBeenCalledWith(docs[0]);
    });

    it("показывает 'Подписать' только для неподписанных и вызывает onSign", async () => {
        const onSign = vi.fn();
        render(<DocumentList documents={docs} onSign={onSign}/>);
        // Кнопка есть только у неподписанного документа (первого).
        const signButtons = screen.getAllByText("Подписать");
        expect(signButtons).toHaveLength(1);
        await userEvent.click(signButtons[0]);
        expect(onSign).toHaveBeenCalledWith(docs[0]);
    });
});
