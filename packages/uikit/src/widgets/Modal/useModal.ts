import get from "lodash/get";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { serialize } from "../../util/serialize";
import { Context } from "./ModalContext";
import { Handler } from "./types";

const splitFunctionProps = (props: Record<string, any>) =>
  Object.entries(props).reduce(
    (result, [key, value]) => {
      if (typeof value === "function") {
        // eslint-disable-next-line no-param-reassign
        result.functionProps[key] = value;
      } else {
        // eslint-disable-next-line no-param-reassign
        result.otherProps[key] = value;
      }
      return result;
    },
    { otherProps: {} as Record<string, any>, functionProps: {} as Record<string, any> }
  );

/**
 * WARNING:
 *
 * Make sure to wrap function props with `useCallback` to prevent infinite rerenders if `updateOnPropsChange` is true.
 *
 */
const useModal = (
  modal: React.ReactNode,
  closeOnOverlayClick = true,
  updateOnPropsChange = false,
  modalId = "defaultNodeId"
): [Handler, Handler] => {
  const currentModal = useRef<React.ReactNode>();
  currentModal.current = modal;
  const currentModalId = useRef<string>();

  const { isOpen, nodeId, modalNode, setModalNode, onPresent, onDismiss } = useContext(Context);
  const onPresentCallback = useCallback(() => {
    onPresent(currentModal.current, modalId, closeOnOverlayClick);
  }, [modalId, onPresent, closeOnOverlayClick]);

  useEffect(() => {
    currentModalId.current = nodeId;
  }, [nodeId]);

  const onDismissCallback = useCallback(() => {
    if (modalId === currentModalId.current) {
      onDismiss?.();
    }
  }, [onDismiss]);

  // Updates the "modal" component if props are changed
  // Use carefully since it might result in unnecessary rerenders
  // Typically if modal is static there is no need for updates, use when you expect props to change
  useEffect(() => {
    // NodeId is needed in case there are 2 useModal hooks on the same page and one has updateOnPropsChange
    if (updateOnPropsChange && isOpen && nodeId === modalId) {
      const modalProps = get(modal, "props");
      const oldModalProps = get(modalNode, "props");

      if (modalProps && oldModalProps) {
        const { functionProps, otherProps } = splitFunctionProps(modalProps);
        const { functionProps: oldFunctionProps, otherProps: oldOtherProps } = splitFunctionProps(oldModalProps);
        const referenceEqual = Object.entries(functionProps).every(([key, value]) => value === oldFunctionProps[key]);
        // Note: I tried to use lodash isEqual to compare props but it is giving false-negatives too easily
        // For example ConfirmSwapModal in exchange has ~500 lines prop object that stringifies to same string
        // and online diff checker says both objects are identical but lodash isEqual thinks they are different
        // Do not try to replace JSON.stringify with isEqual, high risk of infinite rerenders
        // TODO: Find a good way to handle modal updates, this whole flow is just backwards-compatible workaround,
        // would be great to simplify the logic here
        if (!referenceEqual || serialize(otherProps) !== serialize(oldOtherProps)) {
          setModalNode(modal);
        }
      }
    }
  }, [updateOnPropsChange, nodeId, modalId, isOpen, modal, modalNode, setModalNode]);

  return [onPresentCallback, onDismissCallback];
};

export default useModal;
