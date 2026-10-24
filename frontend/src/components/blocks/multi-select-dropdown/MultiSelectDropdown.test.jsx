import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MultiSelectDropdown from "./MultiSelectDropdown.jsx";

const options = [
    {id: 1, name: "Замер"},
    {id: 2, name: "Монтаж"},
    {id: 3, name: "Демонтаж"},
];

describe("MultiSelectDropdown", () => {
    it("показывает количество выбранного на кнопке", async () => {
        render(<MultiSelectDropdown options={options} selected={[1, 2]} setSelected={() => {}}/>);
        expect(screen.getByRole("button")).toHaveTextContent("2 выбрано");
    });

    it("предвыбранные числовые id отмечены галочкой (регрессия на рассинхрон типов)", async () => {
        render(<MultiSelectDropdown options={options} selected={[2]} setSelected={() => {}}/>);
        await userEvent.click(screen.getByRole("button"));

        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes[0]).not.toBeChecked(); // Замер
        expect(checkboxes[1]).toBeChecked();     // Монтаж (id=2)
        expect(checkboxes[2]).not.toBeChecked(); // Демонтаж
    });

    it("клик по невыбранной опции добавляет её id", async () => {
        const setSelected = vi.fn();
        render(<MultiSelectDropdown options={options} selected={[]} setSelected={setSelected}/>);
        await userEvent.click(screen.getByRole("button"));
        await userEvent.click(screen.getByText("Монтаж"));

        // setSelected вызывается с функцией-апдейтером — прогоняем её через текущее состояние []
        const updater = setSelected.mock.calls[0][0];
        expect(updater([])).toEqual([2]);
    });

    it("клик по выбранной опции убирает её id", async () => {
        const setSelected = vi.fn();
        render(<MultiSelectDropdown options={options} selected={[2]} setSelected={setSelected}/>);
        await userEvent.click(screen.getByRole("button"));
        await userEvent.click(screen.getByText("Монтаж"));

        const updater = setSelected.mock.calls[0][0];
        expect(updater([2])).toEqual([]);
    });
});
