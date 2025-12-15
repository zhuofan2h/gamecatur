import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess, Square, Move, PieceSymbol } from 'chess.js';
import { Peer, DataConnection } from 'peerjs';
import { GameState, PlayerColor, GameMode, OpponentType, Difficulty, NetworkMove } from '../types';
import { getAIMove } from '../services/aiLogic';
import { soundManager } from '../services/soundManager';

const TIME_CONTROLS: Record<GameMode, number> = {
  untimed: Infinity,
  rapid: 600, // 10 mins
  blitz: 300, // 5 mins
  bullet: 60, // 1 min
};

export type GameStatus = 'menu' | 'playing' | 'lobby';

// Type for pending promotion
export interface PromotionRequest {
  from: Square;
  to: Square;
  color: PlayerColor;
}

export const useChessGame = () => {
  const gameRef = useRef(new Chess());
  const timerRef = useRef<number | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  // Change default music state to TRUE
  const [isMusicOn, setIsMusicOn] = useState(true);
  
  // ONLINE STATE
  const [peer, setPeer] = useState<Peer | null>(null);
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [myOnlineColor, setMyOnlineColor] = useState<PlayerColor | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    fen: gameRef.current.fen(),
    isGameOver: false,
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    isTimeout: false,
    winner: null,
    losingKingSquare: null,
    turn: PlayerColor.WHITE,
    history: [],
    capturedWhite: [],
    capturedBlack: [],
    whiteTime: TIME_CONTROLS.untimed,
    blackTime: TIME_CONTROLS.untimed,
    mode: 'untimed',
    opponent: 'ai',
    difficulty: 'medium',
    onlineId: '',
    isOnlineHost: false
  });

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  
  // State to track if we need to show the promotion UI
  const [promotionPending, setPromotionPending] = useState<PromotionRequest | null>(null);

  // --- AUDIO UNLOCKER ---
  useEffect(() => {
    const handleInteraction = () => {
      if (isMusicOn) {
         soundManager.initializeAudio();
         soundManager.toggleMusic(true);
      }
      
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isMusicOn]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimeout = (loserColor: PlayerColor) => {
    stopTimer();
    
    // Find losing king position for visual effects
    let losingKingPos: Square | null = null;
    const board = gameRef.current.board();
    for(let r=0; r<8; r++){
        for(let c=0; c<8; c++){
            const piece = board[r][c];
            if(piece && piece.type === 'k' && piece.color === loserColor){
                const files = ['a','b','c','d','e','f','g','h'];
                const ranks = ['8','7','6','5','4','3','2','1'];
                losingKingPos = (files[c] + ranks[r]) as Square;
                break;
            }
        }
    }

    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isTimeout: true,
      winner: loserColor === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE,
      losingKingSquare: losingKingPos
    }));
  };

  // Timer Effect
  useEffect(() => {
    if (gameStatus !== 'playing' || gameState.mode === 'untimed' || gameState.isGameOver) {
      stopTimer();
      return;
    }

    if (!timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.isGameOver) return prev;

          const isWhiteTurn = prev.turn === PlayerColor.WHITE;
          
          // Logic: Decrement time for the current player
          const newWhiteTime = isWhiteTurn ? Math.max(0, prev.whiteTime - 1) : prev.whiteTime;
          const newBlackTime = !isWhiteTurn ? Math.max(0, prev.blackTime - 1) : prev.blackTime;

          if (newWhiteTime === 0) {
            handleTimeout(PlayerColor.WHITE);
          }
          if (newBlackTime === 0) {
            handleTimeout(PlayerColor.BLACK);
          }

          return {
            ...prev,
            whiteTime: newWhiteTime,
            blackTime: newBlackTime
          };
        });
      }, 1000);
    }

    return () => stopTimer();
  }, [gameState.turn, gameState.mode, gameState.isGameOver, gameStatus]);

  const updateState = useCallback(() => {
    const game = gameRef.current;
    
    // Captured pieces logic
    const history = game.history({ verbose: true });
    const capturedWhite: any[] = [];
    const capturedBlack: any[] = [];
    
    history.forEach(move => {
      if (move.captured) {
        if (move.color === 'w') {
          capturedBlack.push(move.captured);
        } else {
          capturedWhite.push(move.captured);
        }
      }
    });

    let winner = null;
    let losingKingPos: Square | null = null;

    if (game.isCheckmate()) {
      winner = game.turn() === 'w' ? PlayerColor.BLACK : PlayerColor.WHITE;
      const loserColor = game.turn();
      const board = game.board();
      for(let r=0; r<8; r++){
          for(let c=0; c<8; c++){
              const piece = board[r][c];
              if(piece && piece.type === 'k' && piece.color === loserColor){
                  const files = ['a','b','c','d','e','f','g','h'];
                  const ranks = ['8','7','6','5','4','3','2','1'];
                  losingKingPos = (files[c] + ranks[r]) as Square;
              }
          }
      }
    }

    setGameState(prev => ({
      ...prev,
      fen: game.fen(),
      isGameOver: game.isGameOver(),
      isCheck: game.inCheck(),
      isCheckmate: game.isCheckmate(),
      isDraw: game.isDraw(),
      winner,
      losingKingSquare: losingKingPos,
      turn: game.turn() as PlayerColor,
      history: game.history(),
      capturedWhite,
      capturedBlack
    }));

    if (game.isGameOver()) {
      stopTimer();
    }
  }, [gameState.isGameOver]);

  const handleMoveSound = (move: Move, game: Chess) => {
    if (game.inCheck() && !game.isGameOver()) {
        soundManager.playCheck();
    } else if (move.captured) {
        soundManager.playCapture();
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
        soundManager.playCastle();
    } else if (move.flags.includes('p')) {
        soundManager.playPromote();
    } else {
        soundManager.playMove();
    }
  }

  // --- ONLINE LOGIC START ---

  // Host a game
  const hostOnlineGame = () => {
    // Generate format: DE + 3 random digits (e.g., DE007, DE999)
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const customId = `DE${randomDigits}`;
    
    const newPeer = new Peer(customId);
    
    newPeer.on('open', (id) => {
        setRoomId(id);
        setPeer(newPeer);
        setGameState(prev => ({ ...prev, onlineId: id, isOnlineHost: true }));
    });

    newPeer.on('connection', (connection) => {
        setConn(connection);
        // Important: Host is WHITE, but we only start game when connection is OPEN
        setMyOnlineColor(PlayerColor.WHITE);
        setupConnection(connection);
    });

    newPeer.on('error', (err: any) => {
        // Handle ID collision by retrying with a new ID
        if (err.type === 'unavailable-id') {
            console.warn(`ID ${customId} taken, retrying...`);
            newPeer.destroy();
            hostOnlineGame(); // Recursive retry
        } else {
            console.error("Peer Error:", err);
            // If connection fails, user might need to restart
        }
    });
  };

  // Join a game
  const joinOnlineGame = (hostId: string) => {
      const newPeer = new Peer();
      
      newPeer.on('open', (id) => {
          setPeer(newPeer);
          const connection = newPeer.connect(hostId);
          setConn(connection);
          setMyOnlineColor(PlayerColor.BLACK); // Joiner is BLACK
          setupConnection(connection);
      });

      newPeer.on('error', (err: any) => {
          console.error("Peer Join Error:", err);
          if (err.type === 'peer-unavailable') {
               alert(`Room ID ${hostId} not found. Please check again.`);
          } else {
               alert("Connection error: " + err.type);
          }
      });
  };

  const setupConnection = (connection: DataConnection) => {
      connection.on('open', () => {
          setIsPeerConnected(true);
          // BOTH players switch to 'playing' when the connection is fully open
          setGameStatus('playing');
          startGame(); 
          console.log("Connected!");
      });

      connection.on('data', (data: any) => {
          if (data && data.type === 'MOVE') {
              // Apply move from opponent
              const move = gameRef.current.move({
                  from: data.from,
                  to: data.to,
                  promotion: data.promotion
              });

              if (move) {
                  handleMoveSound(move, gameRef.current);
                  updateState();
              }
          }
      });

      connection.on('close', () => {
          setIsPeerConnected(false);
          alert("Opponent disconnected!");
          setGameStatus('menu');
      });
      
      connection.on('error', (err) => {
          console.error("Connection Error:", err);
          alert("Connection lost.");
          setGameStatus('menu');
      });
  };

  const sendMove = (from: Square, to: Square, promotion?: string) => {
      if (conn && isPeerConnected) {
          const payload: NetworkMove = { type: 'MOVE', from, to, promotion };
          conn.send(payload);
      }
  };

  // --- ONLINE LOGIC END ---

  // AI Move Effect
  useEffect(() => {
    if (
      gameStatus === 'playing' &&
      gameState.opponent === 'ai' && 
      gameState.turn === PlayerColor.BLACK && 
      !gameState.isGameOver &&
      !promotionPending
    ) {
      const timeoutId = setTimeout(() => {
        const aiMove = getAIMove(gameRef.current, gameState.difficulty);
        if (aiMove) {
          try {
             const moveResult = gameRef.current.move(aiMove);
             if (moveResult) {
               handleMoveSound(moveResult, gameRef.current);
               updateState();
             }
          } catch (e) {
             console.error("AI Move Error", e);
          }
        }
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.turn, gameState.opponent, gameState.isGameOver, updateState, gameStatus, gameState.difficulty, promotionPending]);

  const handleSquareClick = (square: Square) => {
    const game = gameRef.current;
    if (gameState.isGameOver || gameStatus !== 'playing') return;
    if (promotionPending) return;

    // AI Check
    if (gameState.opponent === 'ai' && gameState.turn === PlayerColor.BLACK) return;

    // ONLINE CHECK: If online, only allow move if it's MY turn and I am that color
    if (gameState.opponent === 'online') {
        if (!myOnlineColor) return; // Not fully connected
        if (game.turn() !== myOnlineColor) return; // Not my turn
        
        // Prevent selecting opponent pieces
        const piece = game.get(square);
        if (piece && piece.color !== myOnlineColor && !selectedSquare) return;
    }

    // Case 1: Deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setPossibleMoves([]);
      return;
    }

    // Case 2: Move
    if (selectedSquare && possibleMoves.includes(square)) {
      try {
        // CHECK FOR PROMOTION
        const verboseMoves = game.moves({ verbose: true });
        const isPromotion = verboseMoves.some(
            m => m.from === selectedSquare && m.to === square && m.flags.includes('p')
        );

        if (isPromotion) {
            setPromotionPending({
                from: selectedSquare,
                to: square,
                color: game.turn() as PlayerColor
            });
            return;
        }

        // Standard move
        const move = game.move({
          from: selectedSquare,
          to: square,
        });

        if (move) {
          handleMoveSound(move, game);
          updateState();
          
          // SEND ONLINE MOVE
          if (gameState.opponent === 'online') {
              sendMove(selectedSquare, square);
          }

          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Case 3: Select
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      soundManager.playSelect();
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true }).map(m => m.to as Square);
      setPossibleMoves(moves);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const handlePromotionSelection = (pieceSymbol: PieceSymbol) => {
    if (!promotionPending) return;

    const game = gameRef.current;
    try {
        const move = game.move({
            from: promotionPending.from,
            to: promotionPending.to,
            promotion: pieceSymbol
        });

        if (move) {
            handleMoveSound(move, game);
            updateState();
            
            // SEND ONLINE MOVE w/ PROMOTION
            if (gameState.opponent === 'online') {
                sendMove(promotionPending.from, promotionPending.to, pieceSymbol);
            }

            setSelectedSquare(null);
            setPossibleMoves([]);
            setPromotionPending(null);
        }
    } catch (e) {
        console.error("Promotion failed", e);
        setPromotionPending(null);
    }
  };

  const setGameMode = (mode: GameMode) => {
    setGameState(prev => ({ ...prev, mode }));
  };

  const setOpponent = (opponent: OpponentType) => {
    setGameState(prev => ({ ...prev, opponent }));
  }

  const setDifficulty = (difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  }

  const toggleMusic = () => {
    const newState = !isMusicOn;
    setIsMusicOn(newState);
    soundManager.toggleMusic(newState);
  };

  const startGame = () => {
    gameRef.current.reset();
    stopTimer();
    soundManager.playStart();
    
    if (isMusicOn) {
        soundManager.toggleMusic(true);
    }
    
    setGameState(prev => ({
        ...prev,
        fen: gameRef.current.fen(),
        isGameOver: false,
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        isTimeout: false,
        winner: null,
        losingKingSquare: null,
        turn: PlayerColor.WHITE,
        history: [],
        capturedWhite: [],
        capturedBlack: [],
        whiteTime: TIME_CONTROLS[prev.mode],
        blackTime: TIME_CONTROLS[prev.mode],
    }));
    setSelectedSquare(null);
    setPossibleMoves([]);
    setPromotionPending(null);
    setGameStatus('playing');
  };

  const quitToMenu = () => {
    stopTimer();
    // CLEANUP PEER
    if (peer) {
        peer.destroy();
        setPeer(null);
    }
    setConn(null);
    setIsPeerConnected(false);
    setMyOnlineColor(null);
    setRoomId(''); // Clear Room ID on exit
    setGameStatus('menu');
  }

  const resetGame = () => {
    // If online, we shouldn't allow instant reset without opponent agreement,
    // but for "Wane" version, maybe just re-send start or ignore.
    if (gameState.opponent === 'online') return; 
    startGame();
  };

  return {
    game: gameRef.current,
    gameState,
    gameStatus,
    selectedSquare,
    possibleMoves,
    isMusicOn,
    promotionPending,
    roomId,
    isPeerConnected,
    myOnlineColor,
    handlePromotionSelection,
    toggleMusic,
    handleSquareClick,
    resetGame,
    startGame,
    quitToMenu,
    setGameMode,
    setOpponent,
    setDifficulty,
    setGameStatus, // Exposed to enter Lobby
    hostOnlineGame,
    joinOnlineGame
  };
};