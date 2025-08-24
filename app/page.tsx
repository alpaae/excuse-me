export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ExcuseME
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Генератор вежливых отмазок
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-300">
              Приложение в разработке. Скоро здесь будет генератор отмазок!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
