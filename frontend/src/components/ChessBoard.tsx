import { getPieceImage } from "../utils/pieces";
import type {
  BoardPosition,
  ChessGame,
  ChessMove,
  ChessPiece,
  DraggedPiece,
  PieceImages,
} from "../utils/types";
import type { PointerEvent as ReactPointerEvent } from "react";

type ChessBoardProps = {
  game: ChessGame;
  board: ChessPiece[][];
  caseBoard: string[][];
  borderThemeClass: string;
  whiteCaseClass: string;
  darkCaseClass: string;
  pieceImages: PieceImages;
  legalMoves: ChessMove[];
  draggedPiece: DraggedPiece | null;
  selectedSquare: BoardPosition | null;
  mousePosition: { x: number; y: number };
  onSquareClick: (row: number, col: number) => void;
  onPointerDown: (
    event: ReactPointerEvent<HTMLDivElement>,
    row: number,
    col: number,
  ) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export default function ChessBoard({
  game,
  board,
  caseBoard,
  borderThemeClass,
  whiteCaseClass,
  darkCaseClass,
  pieceImages,
  legalMoves,
  draggedPiece,
  selectedSquare,
  mousePosition,
  onSquareClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ChessBoardProps) {
  return (
    <div
      className={`grid aspect-square w-full touch-none grid-cols-8 grid-rows-8 overflow-hidden rounded-lg shadow-2xl ring-2 ring-purple-500/20 sm:rounded-2xl sm:ring-4 ${borderThemeClass}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {board.map((row, rowIndex) =>
        row.map((piece, columnIndex) => {
          const pieceImage = getPieceImage(piece, pieceImages);
          const isDark = (rowIndex + columnIndex) % 2 === 1;
          const square = caseBoard[rowIndex][columnIndex];
          const isDragging =
            draggedPiece?.row === rowIndex && draggedPiece?.col === columnIndex;
          const isSelected =
            selectedSquare?.row === rowIndex && selectedSquare?.col === columnIndex;
          const isKingInCheck =
            game.chess.isCurrentPlayerInCheck &&
            piece?.chessPieceType === "king" &&
            piece.chessPieceColor === game.chess.currentPlayerColor;
          const isLegalMove = legalMoves.some((move) => move.targetSquare === square);

          return (
            <div
              key={`${rowIndex}-${columnIndex}`}
              onClick={() => onSquareClick(rowIndex, columnIndex)}
              onPointerDown={(event: ReactPointerEvent<HTMLDivElement>) =>
                onPointerDown(event, rowIndex, columnIndex)
              }
              className={`relative flex aspect-square touch-none select-none cursor-grab items-center justify-center transition-all ${
                isDragging ? "scale-105 opacity-30" : ""
              } ${isDark ? darkCaseClass : whiteCaseClass} ${
                isSelected ? "ring-4 ring-inset ring-violet-400" : ""
              } ${isKingInCheck ? "ring-4 ring-inset ring-red-500" : ""}`}
            >
              {pieceImage && (
                <img
                  src={pieceImage}
                  alt=""
                  draggable={false}
                  className="pointer-events-none h-[88%] w-[88%] object-contain drop-shadow-lg"
                />
              )}

              {isLegalMove && !pieceImage && (
                <div className="pointer-events-none absolute h-5 w-5 animate-pulse rounded-full bg-violet-500/80 shadow-lg" />
              )}

              {isLegalMove && pieceImage && (
                <div className="pointer-events-none absolute inset-1 rounded-full border-4 border-fuchsia-400/90 shadow-inner" />
              )}
            </div>
          );
        }),
      )}

      {draggedPiece && (
        <img
          src={getPieceImage(draggedPiece.piece, pieceImages)}
          alt=""
          draggable={false}
          className="pointer-events-none fixed z-50 h-16 w-16 object-contain drop-shadow-2xl sm:h-24 sm:w-24"
          style={{
            left: mousePosition.x - 32,
            top: mousePosition.y - 32,
          }}
        />
      )}
    </div>
  );
}
