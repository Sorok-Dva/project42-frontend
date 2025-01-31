import { createContext, useContext } from 'react'

/**
 * Represents the contexts value for managing the state of a profile modal.
 * Provides methods to open and close the modal.
 *
 * Methods:
 * - openModal: Opens the profile modal for a given user based on their nickname.
 * - closeModal: Closes the currently opened profile modal.
 */
interface ProfileModalContextValue {
  openModal: (nickname: string) => void;
  closeModal: () => void;
}

/**
 * ProfileModalContext is a React contexts object that provides access to methods for managing the state
 * of a profile modal within a React application. It allows components to access and update the state
 * of the modal, such as opening and closing it, without requiring explicit prop drilling.
 *
 * The contexts value is initialized with default implementations for `openModal` and `closeModal`
 * functions, which serve as placeholders and should be overridden when the contexts provider is defined.
 *
 * Accessing the contexts typically involves using React's `useContext` hook along with the contexts
 * provided by `ProfileModalContext`.
 */
const ProfileModalContext = createContext<ProfileModalContextValue>({
  openModal: () => {},
  closeModal: () => {}
})

/**
 * useProfileModal is a custom hook that provides access to the contexts
 * of the ProfileModal. It utilizes the React useContext hook to retrieve
 * and return the current state or functionality exposed by the ProfileModalContext.
 *
 * This hook is intended to simplify access to the ProfileModalContext and can
 * only be used within a component that is wrapped by a ProfileModalContext.Provider.
 *
 * @returns {*} The value provided by ProfileModalContext.
 * @throws {Error} If used outside of a ProfileModalContext.Provider.
 */
export const useProfileModal = () => useContext(ProfileModalContext)

export default ProfileModalContext
