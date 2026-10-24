import {Component} from "react";

// Глобальный перехватчик ошибок рендера: без него любое исключение в дереве
// компонентов роняет весь SPA в белый экран. Показываем аккуратный фоллбэк
// и логируем ошибку (сюда же удобно повесить отправку в аналитику/Sentry).
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error, info) {
        console.error("Необработанная ошибка UI:", error, info);
    }

    handleReload = () => {
        this.setState({hasError: false});
        window.location.assign("/");
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
                    <h1 className="text-xl font-semibold text-custom-black">Что-то пошло не так</h1>
                    <p className="text-gray-500">Попробуйте обновить страницу.</p>
                    <button onClick={this.handleReload} className="px-4 py-2 rounded bg-custom-black text-custom-yellow">
                        На главную
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
