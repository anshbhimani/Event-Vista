import { useState, useEffect } from 'react';
import './AttendeeDashboardBackup.css'

export function AttendeeDashboardBackup() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        if (window.pageYOffset >= 20) {
          nav.classList.add('nav');
        } else {
          nav.classList.remove('nav');
        }

        if (window.pageYOffset >= 700) {
          nav.classList.add('navBlack');
        } else {
          nav.classList.remove('navBlack');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className='attendee-dashboard'>
      <header>
        <div className="popular-movie-slider" style={{ height: '100vh' }}>
          <img src="https://imageio.forbes.com/blogs-images/scottmendelson/files/2014/10/2v00kg8.jpg?format=jpg&width=1200" className="poster" alt="Movie Poster" />

          <div className="popular-movie-slider-content">
            <p className="release">2017</p>
            <h2 className="movie-name">Interstellar</h2>
            <ul className="category">
              <p>Science fiction</p>
              <li>drama</li>
              <li>action</li>
            </ul>
            <p className="desc">
              Interstellar is a 2014 epic science fiction film co-written, directed, and produced by Christopher Nolan. It stars Matthew McConaughey, Anne Hathaway,
              Jessica Chastain, Bill Irwin, Ellen Burstyn, Matt Damon, and Michael Caine. Set in a dystopian future where humanity is embroiled in a catastrophic
              blight and famine, the film follows a group of astronauts who travel through a wormhole near Saturn in search of a new home for humankind.
            </p>

            <div className="movie-info">
              <i className="fa fa-clock-o">
                {' '}
                &nbsp;&nbsp;&nbsp;<span>164 min.</span>
              </i>
              <i className="fa fa-volume-up">
                {' '}
                &nbsp;&nbsp;&nbsp;<span>Subtitles</span>
              </i>
              <i className="fa fa-circle">
                {' '}
                &nbsp;&nbsp;&nbsp;<span>Imdb: <b>9.1/10</b></span>
              </i>
            </div>

            <div className="movie-btns">
              <button>
                <i className="fa fa-play"></i> &nbsp; Watch trailer
              </button>
              <button className="read-more">
                <i className="fa fa-circle"></i> <i className="fa fa-circle"></i> <i className="fa fa-circle"></i>&nbsp; Read more
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
