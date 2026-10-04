import { useState, useEffect } from "react";
import Header from "../components/Header";
import socket from "../services/socket";
import { getMyProfile } from "../services/users";

import bb from "../assets/pieces/bb.svg";
import bw from "../assets/pieces/bw.svg";
import kb from "../assets/pieces/kb.svg";
import kw from "../assets/pieces/kw.svg";
import nb from "../assets/pieces/nb.svg";
import nw from "../assets/pieces/nw.svg";
import pb from "../assets/pieces/pb.svg";
import pw from "../assets/pieces/pw.svg";
import qb from "../assets/pieces/qb.svg";
import qw from "../assets/pieces/qw.svg";
import rb from "../assets/pieces/rb.svg";
import rw from "../assets/pieces/rw.svg";

type ChessPiece = {
  chessPieceType: string;
  chessPieceColor: "white" | "black";
} | null;

type ChessMove = {
  startingSquare: string;
  targetSquare: string;
  chessPieceType: string;
  capturedChessPieceType: string | null;
  promotionChessPieceType: string | null;
  standardAlgebraicNotation: string;
};

type ChessGame = {
  id: string;
  white: string;
  black: string | null;
  chess: {
    chessBoard: ChessPiece[][];
    currentPlayerColor: "white" | "black";
    isGameFinished: boolean;
    chessGameResult: string | null;
    chessGameEndReason: string | null;
    isCurrentPlayerInCheck: boolean;
    currentPositionFen: string;
    moveHistory: ChessMove[];
  };
};

const caseBoard = [
  ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
  ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
  ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
  ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
  ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
  ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
  ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
  ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"],
];

function getPieceImage(piece: ChessPiece) {
  if (!piece) {
    return undefined;
  }

  if (piece.chessPieceColor === "white") {
    switch (piece.chessPieceType) {
      case "pawn":
        return pw;
      case "rook":
        return rw;
      case "knight":
        return nw;
      case "bishop":
        return bw;
      case "queen":
        return qw;
      case "king":
        return kw;
    }
  }

  if (piece.chessPieceColor === "black") {
    switch (piece.chessPieceType) {
      case "pawn":
        return pb;
      case "rook":
        return rb;
      case "knight":
        return nb;
      case "bishop":
        return bb;
      case "queen":
        return qb;
      case "king":
        return kb;
    }
  }

  return undefined;
}

function Chess() {
  const [game, setGame] = useState<ChessGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joinGameId, setJoinGameId] = useState("");
  const [myAuthId, setMyAuthId] = useState<string | null>(null);

  const [draggedPiece, setDraggedPiece] = useState<{
    row: number;
    col: number;
    piece: ChessPiece;
  } | null>(null);

  const [promotionSquare, setPromotionSquare] = useState<{
    startingSquare: string;
    targetSquare: string;
    pieceColor: "white" | "black";
  } | null>(null);

  const [legalMoves, setLegalMoves] = useState<ChessMove[]>([]);

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    async function loadProfile() {
      const result = await getMyProfile();

      if (result.ok) {
        setMyAuthId(result.data.authId);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    function updateGame(gameState: ChessGame) {
      console.log("GAME RECUE :", gameState);
      console.log("BOARD RECUE :", gameState.chess?.chessBoard);

      setGame(gameState);
      setDraggedPiece(null);
      setLegalMoves([]);
      setError("");
    }

    function handleGameActive(gameState: ChessGame | null) {
      setGame(gameState);
    }

    function handleLegalMoves(data: {
      startingSquare: string;
      legalMoves: ChessMove[];
    }) {
      setLegalMoves(data.legalMoves);
    }

    function handleGameError(data: { message: string }) {
      console.error(data.message);
      setError(data.message);
      setDraggedPiece(null);
    }

    socket.on("game:created", updateGame);
    socket.on("game:ready", updateGame);
    socket.on("game:updated", updateGame);
    socket.on("game:ended", updateGame);

    socket.on("game:active", handleGameActive);
    socket.on("game:legal-moves", handleLegalMoves);
    socket.on("game:error", handleGameError);

    socket.emit("game:get-active");

    return () => {
      socket.off("game:created", updateGame);
      socket.off("game:ready", updateGame);
      socket.off("game:updated", updateGame);
      socket.off("game:ended", updateGame);

      socket.off("game:active", handleGameActive);
      socket.off("game:legal-moves", handleLegalMoves);
      socket.off("game:error", handleGameError);
    };
  }, []);

  let myColor: "white" | "black" | null = null;

  if (game && myAuthId) {
    if (game.white === myAuthId) {
      myColor = "white";
    } else if (game.black === myAuthId) {
      myColor = "black";
    }
  }

  function createGame() {
    setError(null);
    socket.emit("game:create");
  }

  function joinGame() {
    const gameId = joinGameId.trim();

    if (gameId === "") {
      return;
    }

    setError(null);
    socket.emit("game:join", gameId);
    setJoinGameId("");
  }

  function cancelGame() {
    if (!game) return;

    socket.emit("game:leave", game.id);

    setGame(null);
    setJoinGameId("");
    setLegalMoves([]);
  }

  function resignGame() {
    if (!game) return;

    socket.emit("game:resign", game.id);
  }

  function endGame() {
    if (!game) return;

    setError("");
    setJoinGameId("");
    setLegalMoves([]);
    setGame(null);
  }

  function getEndReasonText(reason: string | null) {
    switch (reason) {
      case "checkmate":
        return "Échec et mat";
      case "resignation":
        return "Abandon";
      case "stalemate":
        return "Pat";
      case "draw":
        return "Match nul";
      default:
        return "Partie terminée";
    }
  }

  function getGameResult(result: string | null) {
    if (result === "draw") {
      return "Draw";
    }

    if (result === "whitePlayerWon") {
      return myColor === "white" ? "Victoire" : "Défaite";
    }

    if (result === "blackPlayerWon") {
      return myColor === "black" ? "Victoire" : "Défaite";
    }

    return "Partie terminée";
  }

  function getBackendCoordinates(row: number, col: number) {
    if (myColor === "black") {
      return {
        row: 7 - row,
        col: 7 - col,
      };
    }

    return {
      row,
      col,
    };
  }

  const handleMouseDown = (
    event: React.MouseEvent,
    row: number,
    col: number,
  ) => {
    if (!game) {
      return;
    }

    const { row: backendRow, col: backendCol } = getBackendCoordinates(
      row,
      col,
    );

    const piece = game.chess.chessBoard[backendRow][backendCol];

    if (piece === null) {
      return;
    }

    event.preventDefault();

    const startingSquare = caseBoard[backendRow][backendCol];

    socket.emit("game:get-legal-moves", {
      gameId: game.id,
      startingSquare,
    });

    setDraggedPiece({
      row,
      col,
      piece,
    });

    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggedPiece) {
      return;
    }

    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!draggedPiece || !game) {
      return;
    }

    const boardElement = event.currentTarget as HTMLElement;
    const rect = boardElement.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      setDraggedPiece(null);
      setLegalMoves([]);
      return;
    }

    const squareWidth = rect.width / 8;
    const squareHeight = rect.height / 8;

    const targetCol = Math.floor(x / squareWidth);
    const targetRow = Math.floor(y / squareHeight);

    // Case de départ : coordonnées visuelles -> backend
    const { row: startBackendRow, col: startBackendCol } =
      getBackendCoordinates(draggedPiece.row, draggedPiece.col);

    const startingSquare = caseBoard[startBackendRow][startBackendCol];

    // Case d'arrivée : coordonnées visuelles -> backend
    const { row: targetBackendRow, col: targetBackendCol } =
      getBackendCoordinates(targetRow, targetCol);

    const targetSquare = caseBoard[targetBackendRow][targetBackendCol];

    const moveIsLegal = legalMoves.some(
      (move) => move.targetSquare === targetSquare,
    );

    if (!moveIsLegal) {
      setDraggedPiece(null);
      setLegalMoves([]);
      return;
    }

    const piece = draggedPiece.piece;

    const isPromotion =
      piece?.chessPieceType === "pawn" &&
      ((piece.chessPieceColor === "white" && targetSquare[1] === "8") ||
        (piece.chessPieceColor === "black" && targetSquare[1] === "1"));

    if (isPromotion) {
      setPromotionSquare({
        startingSquare,
        targetSquare,
        pieceColor: piece.chessPieceColor,
      });

      setDraggedPiece(null);
      setLegalMoves([]);

      return;
    }

    socket.emit("game:move", {
      gameId: game.id,
      move: {
        startingSquare,
        targetSquare,
      },
    });

    setDraggedPiece(null);
    setLegalMoves([]);
  };

  type PromotionPiece = "queen" | "rook" | "bishop" | "knight";
  function promote(pieceType: PromotionPiece) {
    if (!promotionSquare || !game) {
      return;
    }

    socket.emit("game:move", {
      gameId: game.id,
      move: {
        startingSquare: promotionSquare.startingSquare,
        targetSquare: promotionSquare.targetSquare,
        promotionChessPieceType: pieceType,
      },
    });

    setPromotionSquare(null);
  }

  const displayedBoard =
    myColor === "black"
      ? [...(game?.chess.chessBoard ?? [])]
          .reverse()
          .map((row) => [...row].reverse())
      : (game?.chess.chessBoard ?? []);

  const displayedCaseBoard =
    myColor === "black"
      ? [...caseBoard].reverse().map((row) => [...row].reverse())
      : caseBoard;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Header />

      <section className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          {/* Adversaire */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">Opponent</p>

              <p className="text-sm text-slate-400">1200 Elo</p>
            </div>

            <div>
              {!game && (
                <div className="flex flex-col items-center">
                  <button
                    onClick={createGame}
                    className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
                  >
                    Créer une partie
                  </button>

                  <input
                    type="text"
                    placeholder="Rejoindre une partie"
                    value={joinGameId}
                    onChange={(event) => setJoinGameId(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        joinGame();
                      }
                    }}
                    className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {error && <p className="mt-4 text-red-400">{error}</p>}

              {game && !game?.chess.isGameFinished && (
                <div className="mt-6">
                  <p>Partie : {game.id}</p>

                  <p>Blanc : {game.white}</p>

                  <p>Noir : {game.black ?? "En attente..."}</p>

                  {game.black === null && (
                    <div className="flex flex-col items-center">
                      <p className="mt-4 text-yellow-400">
                        En attente d'un adversaire...
                      </p>

                      <button
                        onClick={cancelGame}
                        className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {game.black !== null && (
                    <p className="mt-4 text-green-400">La partie est prête !</p>
                  )}
                </div>
              )}

              {game && game?.chess.isGameFinished && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-5 py-6 text-center shadow-xl">
                  <p
                    className={`text-xl font-semibold ${
                      game.chess.chessGameResult === "draw"
                        ? "text-yellow-400"
                        : getGameResult(game.chess.chessGameResult) ===
                            "Victoire"
                          ? "text-green-400"
                          : "text-red-400"
                    }`}
                  >
                    {getGameResult(game.chess.chessGameResult)}
                  </p>

                  <p className="text-sm text-slate-400">
                    {getEndReasonText(game.chess.chessGameEndReason)}
                  </p>

                  <button
                    onClick={endGame}
                    className="mt-3 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
                  >
                    Retour
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
              00:00
            </div>
          </div>

          {/* Échiquier */}
          <div className="mx-auto w-full max-w-[640px]">
            {game ? (
              <div
                className="grid aspect-square w-full grid-cols-8 grid-rows-8 border-4 border-slate-800"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {displayedBoard.map((row, rowIndex) =>
                  row.map((piece, columnIndex) => {
                    const pieceImage = getPieceImage(piece);

                    const isDark = (rowIndex + columnIndex) % 2 === 1;

                    const square = displayedCaseBoard[rowIndex][columnIndex];

                    const isDragging =
                      draggedPiece?.row === rowIndex &&
                      draggedPiece?.col === columnIndex;

                    const isLegalMove = legalMoves.some(
                      (move) => move.targetSquare === square,
                    );

                    return (
                      <div
                        key={`${rowIndex}-${columnIndex}`}
                        onMouseDown={(event) =>
                          handleMouseDown(event, rowIndex, columnIndex)
                        }
                        className={`relative flex aspect-square select-none items-center justify-center cursor-grab ${
                          isDragging ? "opacity-30" : ""
                        } ${isDark ? "bg-blue-700" : "bg-slate-200"}`}
                      >
                        {pieceImage && (
                          <img
                            src={pieceImage}
                            alt=""
                            draggable={false}
                            className="pointer-events-none h-[85%] w-[85%] object-contain"
                          />
                        )}

                        {isLegalMove && !pieceImage && (
                          <div className="pointer-events-none absolute h-4 w-4 rounded-full bg-gray-500/90" />
                        )}

                        {isLegalMove && pieceImage && (
                          <div className="pointer-events-none absolute inset-1 rounded-full border-4 border-red-500/80" />
                        )}
                      </div>
                    );
                  }),
                )}

                {/* Pièce qui suit la souris */}
                {draggedPiece && (
                  <img
                    src={getPieceImage(draggedPiece.piece)}
                    alt=""
                    draggable={false}
                    className="pointer-events-none fixed z-50 h-20 w-20 object-contain"
                    style={{
                      left: mousePosition.x - 40,
                      top: mousePosition.y - 40,
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                <p className="text-slate-400">Crée ou rejoins une partie</p>
              </div>
            )}

            {promotionSquare && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                  <h2 className="mb-5 text-center text-xl font-bold">
                    Choisissez une pièce
                  </h2>

                  <div className="flex gap-3">
                    {[
                      {
                        type: "queen" as PromotionPiece,
                        image: promotionSquare.pieceColor === "white" ? qw : qb,
                        alt: "Dame",
                      },
                      {
                        type: "rook" as PromotionPiece,
                        image: promotionSquare.pieceColor === "white" ? rw : rb,
                        alt: "Tour",
                      },
                      {
                        type: "bishop" as PromotionPiece,
                        image: promotionSquare.pieceColor === "white" ? bw : bb,
                        alt: "Fou",
                      },
                      {
                        type: "knight" as PromotionPiece,
                        image: promotionSquare.pieceColor === "white" ? nw : nb,
                        alt: "Cavalier",
                      },
                    ].map((piece) => (
                      <button
                        key={piece.type}
                        onClick={() => promote(piece.type)}
                        className="flex h-24 w-20 items-center justify-center rounded-xl bg-slate-800 transition hover:bg-slate-700"
                      >
                        <img
                          src={piece.image}
                          alt={piece.alt}
                          className="h-16 w-16 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Joueur */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">You</p>

              <p className="text-sm text-slate-400">1200 Elo</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">
              00:00
            </div>
          </div>

          {/* Contrôles */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-semibold transition hover:bg-slate-700"
              onClick={resignGame}
            >
              Resign
            </button>

            <button className="rounded-lg bg-red-600 px-6 py-3 font-semibold transition hover:bg-red-700">
              Draw
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Chess;
