"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Movie {
  title: string;
  rating: string;
  showtimes: string;
  imdbId: string;
  image: string;
}

interface Theater {
  name: string;
  address: string;
  movies: Movie[];
}

const MoviePage: React.FC = () => {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [selectedTheater, setSelectedTheater] = useState<string>("All Theaters");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
    }

    const fetchTheaters = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/theaters");
        setTheaters(response.data.theaters);
      } catch (err: any) {
        console.error("Error fetching theaters:", err);
        setError(err.response?.data?.message || "Failed to load theater data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }

        const response = await fetch("/api/photo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProfilePicture(data.profilePicture);
        } else {
          throw new Error("Failed to fetch photo");
        }
      } catch (error) {
        console.error("Error fetching photo:", error);
        setError("Failed to load photo. Please try again.");
      }
    };

    fetchProfilePicture();
  }, []);

  const filteredMovies = () => {
    if (!searchQuery && selectedTheater === "All Theaters") return theaters;
    return theaters.map((theater) => ({
      ...theater,
      movies: theater.movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(theater => selectedTheater === "All Theaters" || theater.name === selectedTheater);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-blue-900 text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <img
            src="https://i.postimg.cc/GpkGdwHh/BRUIN-2.png"
            alt="Bruin Logo"
            className="w-28 h-28 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => router.push("/movie-page")}
          />
          <div className="flex items-center gap-4">
            <select
              className="bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e.target.value)}
            >
              <option value="All Theaters">All Theaters</option>
              {theaters.map((theater) => (
                <option key={theater.name} value={theater.name}>
                  {theater.name}
                </option>
              ))}
            </select>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="w-6 h-6 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <button
              onClick={() => router.push("/profile")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full transition duration-300"
            >
              Edit Profile
            </button>
            {profilePicture && (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-12 h-12 rounded-full cursor-pointer"
                onClick={() => router.push("/profile")}
              />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-2">Discover Movies Near UCLA</h1>
          <p className="text-lg">Explore the latest films showing in theaters around campus</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-xl">{error}</div>
        ) : (
          filteredMovies().map((theater) =>
            theater.movies.length > 0 ? (
              <div key={theater.name} className="mb-12">
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                  {theater.name}
                </h2>
                <p className="text-gray-400 mb-4 text-sm">{theater.address}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {theater.movies.map((movie) => (
                    <MovieCard key={movie.imdbId} movie={movie} />
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-md py-6 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} UCLA Movie Explorer. All rights reserved.
        </p>
      </footer>
      </div>
  );
};

const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => (
  <Link
    href={{
      pathname: `/${movie.imdbId}`,
      query: {
        showtimes: movie.showtimes,
      }
    }}
  >
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      {movie.image && (
        <div className="relative pb-[150%]">
          <img
            src={movie.image}
            alt={movie.title}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-2">
        <h3 className="text-sm font-bold text-white mb-1 truncate">
          {movie.title}
        </h3>
        <p className="text-yellow-400 flex items-center mb-1 text-xs">
          <span className="mr-1">⭐</span>
          <span>{movie.rating === "N/A" ? "Not Rated" : movie.rating}</span>
        </p>
        <p className="text-gray-400 text-xs truncate">
          <strong>Showtimes:</strong>{" "}
          {movie.showtimes === "No showtimes available on IMDb." ||
          movie.showtimes === "N/A"
            ? "No showtimes listed"
            : movie.showtimes}
        </p>
      </div>
    </div>
  </Link>
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"></div>
);

export default MoviePage;