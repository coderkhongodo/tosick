import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-indigo-600">TOEIC Practice</h1>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <Link href="#features" className="text-gray-500 hover:text-gray-900">
                                Tính năng
                            </Link>
                            <Link href="#pricing" className="text-gray-500 hover:text-gray-900">
                                Bảng giá
                            </Link>
                            <Link href="/login" className="text-gray-500 hover:text-gray-900">
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Đăng ký
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        Luyện thi TOEIC
                        <span className="text-indigo-600"> hiệu quả</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Nâng cao điểm số TOEIC của bạn với hệ thống luyện tập thông minh,
                        đề thi thử chuẩn quốc tế và phân tích kết quả chi tiết.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href="/register"
                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-300"
                        >
                            Đăng ký miễn phí
                        </Link>
                        <Link
                            href="/demo"
                            className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition duration-300"
                        >
                            Bắt đầu luyện tập ngay
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            Tính năng nổi bật
                        </h3>
                        <p className="text-lg text-gray-600">
                            Mọi thứ bạn cần để đạt điểm TOEIC mục tiêu
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-6">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Từ vựng</h4>
                            <p className="text-gray-600">
                                Học từ vựng TOEIC theo chủ đề với flashcards và bài tập tương tác
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center p-6">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Luyện đọc</h4>
                            <p className="text-gray-600">
                                Luyện tập 3 phần Reading với highlight từ vựng và giải thích ngữ pháp
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center p-6">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Đề thi thử</h4>
                            <p className="text-gray-600">
                                Bộ đề thi thử mô phỏng 100% đề thi thật với đồng hồ đếm ngược
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="text-center p-6">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">Phân tích kết quả</h4>
                            <p className="text-gray-600">
                                Biểu đồ tiến bộ và phân tích điểm mạnh/yếu để cải thiện hiệu quả
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-indigo-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">
                        Sẵn sàng đạt điểm TOEIC mục tiêu?
                    </h3>
                    <p className="text-xl text-indigo-100 mb-8">
                        Hàng ngàn học viên đã cải thiện điểm số với nền tảng của chúng tôi
                    </p>
                    <Link
                        href="/register"
                        className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300"
                    >
                        Bắt đầu ngay hôm nay
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="col-span-1">
                            <h4 className="text-xl font-bold text-white mb-4">TOEIC Practice</h4>
                            <p className="text-gray-400">
                                Nền tảng luyện thi TOEIC trực tuyến hàng đầu tại Việt Nam
                            </p>
                        </div>
                        <div>
                            <h5 className="text-lg font-semibold text-white mb-4">Sản phẩm</h5>
                            <ul className="space-y-2">
                                <li><Link href="/vocabulary" className="text-gray-400 hover:text-white">Từ vựng</Link></li>
                                <li><Link href="/reading" className="text-gray-400 hover:text-white">Luyện đọc</Link></li>
                                <li><Link href="/tests" className="text-gray-400 hover:text-white">Đề thi thử</Link></li>
                                <li><Link href="/vocabulary" className="text-gray-400 hover:text-white">Từ vựng</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h5>
                            <ul className="space-y-2">
                                <li><Link href="/help" className="text-gray-400 hover:text-white">Trung tâm hỗ trợ</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white">Liên hệ</Link></li>
                                <li><Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-lg font-semibold text-white mb-4">Công ty</h5>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-400 hover:text-white">Về chúng tôi</Link></li>
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Chính sách bảo mật</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white">Điều khoản</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2024 TOEIC Practice. Tất cả quyền được bảo lưu.
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    )
}
