import React from 'react';
import './Skeleton.css';

const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="skeleton-table-wrapper">
      <table className="admin-table skeleton-table">
        <thead>
          <tr>
            {Array(cols).fill(0).map((_, i) => (
              <th key={i}><div className="skeleton skeleton-text"></div></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows).fill(0).map((_, i) => (
            <tr key={i}>
              {Array(cols).fill(0).map((_, j) => (
                <td key={j}><div className="skeleton skeleton-rect"></div></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
