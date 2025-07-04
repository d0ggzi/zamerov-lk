import {Link} from "react-router-dom";
import {dashboardCellBlock, dashboardCellText} from "./styles.js";

export default function DashboardPage() {
    return (
        <div className="grid grid-cols-3 gap-7 md:pl-10 md:pr-10 md:pt-10">
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Заказы
                </p>
            </Link>
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Заявки
                </p>
            </Link>
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Услуги
                </p>
            </Link>

            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Споры
                </p>
            </Link>
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Документы
                </p>
            </Link>
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Календарь
                </p>
            </Link>

            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Настройки
                </p>
            </Link>
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Частые вопросы
                </p>
            </Link>
            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Оплата
                </p>
            </Link>

            <Link to="/"
                  className={dashboardCellBlock}>
                <p className={dashboardCellText}>
                    Чат
                </p>
            </Link>
        </div>
    )
}