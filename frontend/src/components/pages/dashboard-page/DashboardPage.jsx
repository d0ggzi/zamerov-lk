import {Link} from "react-router-dom";
import {cellBlock, cellText} from "./styles.js";

export default function DashboardPage() {
    return (
        <div className="grid md:grid-cols-3 gap-7 md:pl-10 md:pr-10 md:pt-10">
            <Link to="/orders"
                  className={cellBlock}>
                <p className={cellText}>
                    Заказы
                </p>
            </Link>
            <Link to="/requests"
                  className={cellBlock}>
                <p className={cellText}>
                    Заявки
                </p>
            </Link>
            <Link to="/services"
                  className={cellBlock}>
                <p className={cellText}>
                    Услуги
                </p>
            </Link>

            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Споры
                </p>
            </Link>
            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Документы
                </p>
            </Link>
            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Календарь
                </p>
            </Link>

            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Настройки
                </p>
            </Link>
            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Частые вопросы
                </p>
            </Link>
            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Оплата
                </p>
            </Link>

            <Link to="/"
                  className={cellBlock}>
                <p className={cellText}>
                    Чат
                </p>
            </Link>
        </div>
    )
}