import styled from 'styled-components'

export const TerminalWrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSubtle};
  #jupiter-terminal {
    * {
      font-family: Kanit, sans-serif;
    }
  }

  .focus-within\:shadow-swap-input-dark:focus-within {
    --tw-shadow: 0px 0px 0px 1px #7645d9, 0px 0px 0px 4px rgba(118, 69, 217, 0.2);
  }

  .text-black {
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  .pcs-card {
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    border-bottom-width: 2px;
    background-color: ${({ theme }) => theme.colors.input};
  }

  .-rotate-45 {
    --tw-rotate: -45deg;
  }

  .pcs-refresh-btn {
    border-color: ${({ theme }) => theme.colors.cardBorder};
    svg {
      path {
        fill: ${({ theme }) => theme.colors.primary60};
      }
    }
  }

  .pcs-currency-btn {
    border: none;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.backgroundAlt3};
    cursor: pointer;
    &:hover {
      background-color: ${({ theme }) => theme.colors.backgroundAlt2};
    }
  }

  .pcs-token-info-wrapper {
    svg {
      path {
        fill: ${({ theme }) => theme.colors.textSubtle};
        fill-opacity: 1;
      }
    }
  }

  .pcs-numeric-input {
    border: none;
    outline: none;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  .pcs-submit-button {
    border: none;
    background-color: ${({ theme }) => theme.colors.primary};
    &[disabled] {
      background-color: ${({ theme }) => theme.colors.backgroundDisabled};
      color: ${({ theme }) => theme.colors.textDisabled};
    }
  }

  .pcs-switch-btn {
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    background-color: transparent;
    svg {
      path {
        fill: ${({ theme }) => theme.colors.primary60};
        fill-opacity: 1;
      }
    }
  }

  .pcs-chevron-down-icon {
    svg {
      path {
        fill: ${({ theme }) => theme.colors.textSubtle};
      }
    }
  }

  .pcs-form-error {
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.colors.secondary20};
    background: ${({ theme }) => theme.colors.secondary10};
    color: ${({ theme }) => theme.colors.text};
    .pcs-form-error-msg {
      font-weight: normal;
    }
  }
  .exchange-rate {
    span.whitespace-nowrap {
      color: ${({ theme }) => theme.colors.text};
    }
    svg {
      path {
        fill: ${({ theme }) => theme.colors.primary60};
      }
    }
  }
  .psc-message-box {
    border-radius: 20px;
    border: 1px solid ${({ theme }) => theme.colors.warning20};
    background: ${({ theme }) => theme.colors.warning10};
    color: ${({ theme }) => theme.colors.text};
    margin: 1.25rem;
    width: auto;
  }

  .pcs-info-label {
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  .pcs-info-content {
    color: ${({ theme }) => theme.colors.text};
  }
  .pcs-quote-meta {
    svg {
      path {
        fill: ${({ theme }) => theme.colors.textSubtle};
        fill-opacity: 1;
      }
    }
  }

  .pcs-pair-selector {
    padding: 24px 0px;
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  .pcs-pari-search-box {
    border-radius: 16px;
    border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
    background-color: ${({ theme }) => theme.colors.input};
    padding: 8px 16px;
    > input {
      background: transparent;
    }
  }
  .pcs-token-list {
    padding: 0;
    li {
      background-color: transparent;
      &:hover {
        background-color: ${({ theme }) => theme.colors.background};
      }
      .pcs-pair-row-symbol {
        color: ${({ theme }) => theme.colors.text};
      }
      .pcs-pair-row-name {
        color: ${({ theme }) => theme.colors.textSubtle};
      }
    }
  }
  .webkit-scrollbar {
    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: ${({ theme }) => theme.colors.textSubtle};
    }
    &::-webkit-scrollbar {
      width: 6px;
    }
  }
`
