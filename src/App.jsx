import { useRef, useState, useEffect } from 'react'
import { io } from "socket.io-client";
import './App.css'

const SPRITE_SIZE = 64;
const SPRITE_SHEET_COLS = 4;
const SPRITE_SHEET_ROWS = 4;

const DIRECTIONS = {
  DOWN: 0,
  LEFT: 1,
  RIGHT: 2,
  UP: 3,
};

const socket = io('http://localhost:8080');

function App() {

  const [players, setPlayers] = useState({});
  const canvasRef = useRef(null);
  const spriteSheet = useRef(new Image());

  useEffect(() => {
    spriteSheet.current.src = '/sprite.png';

    socket.on('connect', () => {
      // Definir posição inicial para o jogador ao conectar
      socket.emit('join', {
        id: socket.id,
        x: 50, // Posição inicial x
        y: 50, // Posição inicial y
        direction: DIRECTIONS.DOWN, // Direção inicial
        frame: 0 // Frame inicial
      });
    });

    socket.on('players', (data) => {
      setPlayers(data);
    });

  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Object.values(players).forEach((player) => {
        ctx.drawImage(
          spriteSheet.current,
          player.frame * SPRITE_SIZE,
          (player.direction % SPRITE_SHEET_ROWS) * SPRITE_SIZE,
          SPRITE_SIZE,
          SPRITE_SIZE,
          player.x,
          player.y,
          SPRITE_SIZE,
          SPRITE_SIZE
        );
      });
    };

    draw();
  }, [players]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        let newPos = {};
        let direction = 0;
        const step = 5;
        
        switch (e.key) {
          case 'ArrowUp':
            newPos = { y: players[socket.id]?.y - step || 0 };
            direction = DIRECTIONS.UP;
            break;
          case 'ArrowDown':
            newPos = { y: players[socket.id]?.y + step || 0 };
            direction = DIRECTIONS.DOWN;
            break;
          case 'ArrowLeft':
            newPos = { x: players[socket.id]?.x - step || 0 };
            direction = DIRECTIONS.LEFT;
            break;
          case 'ArrowRight':
            newPos = { x: players[socket.id]?.x + step || 0 };
            direction = DIRECTIONS.RIGHT;
            break;
        }
        
        socket.emit("move", {
          ...newPos,
          direction,
          frame: (players[socket.id]?.frame + 1) % SPRITE_SHEET_COLS,
        });
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {        
        socket.emit("move", {
          ...{ x: players[socket.id]?.x || 0, y: players[socket.id]?.y || 0 },
          direction: players[socket.id]?.direction,
          frame: 0,
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [players]);
  
  return (
    <>
      <canvas
        ref={canvasRef}
        width={1040}
        height={920}
        style={{ border: '1px solid black' }}
      />
    </>
  )
}

export default App
