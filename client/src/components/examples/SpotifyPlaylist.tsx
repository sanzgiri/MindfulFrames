import SpotifyPlaylist from '../SpotifyPlaylist';

export default function SpotifyPlaylistExample() {
  return (
    <div className="p-6 max-w-md">
      <SpotifyPlaylist
        title="Awakening"
        description="Ambient morning, awakening meditation, Brian Eno, Max Richter, Ólafur Arnalds"
        spotifyUrl="https://open.spotify.com/playlist/example"
      />
    </div>
  );
}
