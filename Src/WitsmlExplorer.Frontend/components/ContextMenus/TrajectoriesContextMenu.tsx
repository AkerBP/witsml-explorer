import { Typography } from "@equinor/eds-core-react";
import { MenuItem } from "@material-ui/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  StoreFunction,
  TemplateObjects
} from "components/ContentViews/QueryViewUtils";
import ContextMenu from "components/ContextMenus/ContextMenu";
import {
  StyledIcon,
  menuItemText,
  onClickRefresh
} from "components/ContextMenus/ContextMenuUtils";
import { pasteObjectOnWellbore } from "components/ContextMenus/CopyUtils";
import NestedMenuItem from "components/ContextMenus/NestedMenuItem";
import { useClipboardReferencesOfType } from "components/ContextMenus/UseClipboardReferences";
import { PropertiesModalMode } from "components/Modals/ModalParts";
import TrajectoryPropertiesModal, {
  TrajectoryPropertiesModalProps
} from "components/Modals/TrajectoryPropertiesModal";
import { useConnectedServer } from "contexts/connectedServerContext";
import OperationContext from "contexts/operationContext";
import { DisplayModalAction } from "contexts/operationStateReducer";
import OperationType from "contexts/operationType";
import { useOpenInQueryView } from "hooks/useOpenInQueryView";
import { toWellboreReference } from "models/jobs/wellboreReference";
import { ObjectType } from "models/objectType";
import { Server } from "models/server";
import Trajectory from "models/trajectory";
import Wellbore from "models/wellbore";
import React, { useContext } from "react";
import { colors } from "styles/Colors";
import { v4 as uuid } from "uuid";

export interface TrajectoriesContextMenuProps {
  wellbore: Wellbore;
  servers: Server[];
}

const TrajectoriesContextMenu = (
  props: TrajectoriesContextMenuProps
): React.ReactElement => {
  const { wellbore, servers } = props;
  const { dispatchOperation } = useContext(OperationContext);
  const trajectoryReferences = useClipboardReferencesOfType(
    ObjectType.Trajectory
  );
  const openInQueryView = useOpenInQueryView();
  const { connectedServer } = useConnectedServer();
  const queryClient = useQueryClient();

  const onClickNewTrajectory = () => {
    const newTrajectory: Trajectory = {
      uid: uuid(),
      name: "",
      wellUid: wellbore.wellUid,
      wellName: wellbore.wellName,
      wellboreUid: wellbore.uid,
      wellboreName: wellbore.name,
      serviceCompany: null,
      aziRef: null,
      dTimTrajEnd: null,
      dTimTrajStart: null,
      mdMax: null,
      mdMin: null,
      trajectoryStations: [],
      commonData: null
    };
    const trajectoryPropertiesModalProps: TrajectoryPropertiesModalProps = {
      mode: PropertiesModalMode.New,
      trajectory: newTrajectory,
      dispatchOperation
    };
    const action: DisplayModalAction = {
      type: OperationType.DisplayModal,
      payload: <TrajectoryPropertiesModal {...trajectoryPropertiesModalProps} />
    };
    dispatchOperation(action);
  };

  return (
    <ContextMenu
      menuItems={[
        <MenuItem
          key={"refresh"}
          onClick={() =>
            onClickRefresh(
              dispatchOperation,
              queryClient,
              connectedServer?.url,
              wellbore.wellUid,
              wellbore.uid,
              ObjectType.Trajectory
            )
          }
        >
          <StyledIcon
            name="refresh"
            color={colors.interactive.primaryResting}
          />
          <Typography color={"primary"}>{`Refresh Trajectories`}</Typography>
        </MenuItem>,
        <MenuItem key={"newTrajectory"} onClick={onClickNewTrajectory}>
          <StyledIcon name="add" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>New Trajectory</Typography>
        </MenuItem>,
        <MenuItem
          key={"pasteTrajectory"}
          onClick={() =>
            pasteObjectOnWellbore(
              servers,
              trajectoryReferences,
              dispatchOperation,
              toWellboreReference(wellbore)
            )
          }
          disabled={trajectoryReferences === null}
        >
          <StyledIcon name="paste" color={colors.interactive.primaryResting} />
          <Typography color={"primary"}>
            {menuItemText(
              "paste",
              "trajectory",
              trajectoryReferences?.objectUids
            )}
          </Typography>
        </MenuItem>,
        <NestedMenuItem key={"queryItems"} label={"Query"} icon="textField">
          {[
            <MenuItem
              key={"newObject"}
              onClick={() =>
                openInQueryView({
                  templateObject: TemplateObjects.Trajectory,
                  storeFunction: StoreFunction.AddToStore,
                  wellUid: wellbore.wellUid,
                  wellboreUid: wellbore.uid,
                  objectUid: uuid()
                })
              }
            >
              <StyledIcon
                name="add"
                color={colors.interactive.primaryResting}
              />
              <Typography color={"primary"}>New Trajectory</Typography>
            </MenuItem>
          ]}
        </NestedMenuItem>
      ]}
    />
  );
};

export default TrajectoriesContextMenu;
