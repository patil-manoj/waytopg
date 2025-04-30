import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">404</h1>
        <div className="relative">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzM4MWI4YzMyZDM4ZTM1ZGM1ZmM5N2NiZmQzYWUxYjYxMGE3ZjczYiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/UoeaPqYrimha6rdTFV/giphy.gif"
            alt="Confused character"
            className="w-48 h-48 mx-auto mb-8 rounded-full shadow-lg"
          />
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Oops! Looks like you're lost in the PG maze! 🏠
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Don't worry, even the best room hunters take wrong turns sometimes.
          Let's get you back on track to find your perfect accommodation!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          <span className="mr-2">🏡</span>
          Take Me Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
