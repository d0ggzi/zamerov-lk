import {Link} from "react-router-dom";

export default function DashboardPage() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Заказы
                </p>
            </Link>
            <Link to="/requests"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Заявки
                </p>
            </Link>
            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Услуги
                </p>
            </Link>

            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Споры
                </p>
            </Link>
            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Документы
                </p>
            </Link>
            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Календарь
                </p>
            </Link>

            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Настройки
                </p>
            </Link>
            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Частые вопросы
                </p>
            </Link>
            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Оплата
                </p>
            </Link>

            <Link to="/"
                  className="flex items-center border-3 border-custom-yellow justify-center h-34 rounded-sm bg-gray-50 dark:bg-gray-100">
                <p className="text-2xl text-gray-400 dark:text-custom-black">
                    Чат
                </p>
            </Link>
        </div>
    )
}