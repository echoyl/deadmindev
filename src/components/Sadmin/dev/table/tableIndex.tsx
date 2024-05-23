import { css } from '@emotion/css';
import classNames from 'classnames';
const TableIndex = (props) => {
  const { checked, record, originNode } = props;
  return (
    <div
      className={classNames(
        checked ? 'checked' : null,
        css`
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          padding-right: 8px;
          .de-table-index {
            opacity: 0;
          }
          &:not(.checked) {
            .de-table-index {
              opacity: 1;
            }
          }
          &:hover {
            .de-table-index {
              opacity: 0;
            }
            .de-origin-node {
              display: block;
            }
          }
        `,
      )}
    >
      <div
        className={classNames(
          checked ? 'checked' : null,
          css`
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-evenly;
          `,
        )}
      >
        <div className={classNames('de-table-index')} style={{ padding: '0 8px 0 16px' }}>
          {record.id}
        </div>
      </div>
      <div
        className={classNames(
          'de-origin-node',
          checked ? 'checked' : null,
          css`
            position: absolute;
            right: 50%;
            transform: translateX(50%);
            &:not(.checked) {
              display: none;
            }
          `,
        )}
      >
        {originNode}
      </div>
    </div>
  );
};

export default TableIndex;
