import { _decorator, Component, Vec3, systemEvent, SystemEvent, EventMouse, Animation, SkeletalAnimation, EventTouch } from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    // for fake tween
    private _startJump: boolean = false;
    private _jumpStep: number = 0;
    private _curJumpTime: number = 0;
    private _jumpTime: number = 0.5;
    private _curJumpSpeed: number = 0;
    private _curPos: Vec3 = new Vec3();
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    private _targetPos: Vec3 = new Vec3();
    private _isMoving = false;

    private _curMoveIndex = 0;

    @property({ type: Animation })
    public BodyAnim: Animation | null = null;

    @property({ type: SkeletalAnimation })
    public CocosAnim: SkeletalAnimation | null = null;

    start() {
        // Your initialization goes here.
        // systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
    }


    setInputActive(active: boolean) {
        if (active) {
            systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    onPressButon(event: EventTouch, customEventData: string){
        // console.log('data', data)
        const step: number = parseInt(customEventData)
        this.jumpByStep(step)
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        } else if (event.getButton() === 2) {
            this.jumpByStep(2);
        }

    }

    jumpByStep(step: number) {
        if (this._isMoving) {
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

        if (this.CocosAnim) {
            // The jumping animation takes a long time, here is accelerated playback
            this.CocosAnim.getState('cocos_anim_jump').speed = 3.5;
            // Play jumping animation
            this.CocosAnim.play('cocos_anim_jump');
        }

        if (this.BodyAnim) {
            if (step === 1) {
                //this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }

        this._isMoving = true;
        this._curMoveIndex += step;
    }

    onOnceJumpEnd() {
        this._isMoving = false;
        if (this.CocosAnim) {
            this.CocosAnim.play('cocos_anim_idle');
        }
        this.node.emit('JumpEnd', this._curMoveIndex);
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // end
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            } else {
                // tween
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    reset() {
        this._curMoveIndex = 0;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
